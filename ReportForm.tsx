import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ReportType } from '../types';
import { useLocalization } from '../context/LocalizationContext';
import Card from '../components/Card';
import { assessAnimalPriority, refineLocationQuery } from '../services/geminiService';
import { getCurrentLocation, reverseGeocode, forwardGeocode, Coordinates } from '../lib/locationUtils';
import * as L from 'leaflet';
import { API_BASE_URL } from '../lib/config';

interface ReportFormProps {
  reportType: ReportType;
}

const DEFAULT_CENTER: Coordinates = { latitude: 12.9141, longitude: 74.8560 };
const FILE_SIZE_LIMIT_MB = 50;
const FILE_SIZE_LIMIT_BYTES = FILE_SIZE_LIMIT_MB * 1024 * 1024;


const ReportForm: React.FC<ReportFormProps> = ({ reportType }) => {
  const { t } = useLocalization();
  const navigate = useNavigate();
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [reporterName, setReporterName] = useState('');
  const [reporterPhone, setReporterPhone] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationStatus, setLocationStatus] = useState<string | null>(null);
  const [locationWarning, setLocationWarning] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<{priority: string, justification: string} | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null);
  
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerInstanceRef = useRef<L.Marker | null>(null);
  const analysisTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
        if (mediaPreview) {
            URL.revokeObjectURL(mediaPreview);
        }
    };
  }, [mediaPreview]);

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const iconDefault = L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
    });
    L.Marker.prototype.options.icon = iconDefault;

    const map = L.map(mapContainerRef.current).setView([DEFAULT_CENTER.latitude, DEFAULT_CENTER.longitude], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    mapInstanceRef.current = map;

    const marker = L.marker([DEFAULT_CENTER.latitude, DEFAULT_CENTER.longitude], { draggable: true }).addTo(map);
    markerInstanceRef.current = marker;
    setCoordinates(DEFAULT_CENTER);

    marker.on('dragend', async function(e) {
        const latLng = e.target.getLatLng();
        const newCoords = { latitude: latLng.lat, longitude: latLng.lng };
        setCoordinates(newCoords);
        setLocationStatus(t('location_fetching_area'));
        try {
            const area = await reverseGeocode(newCoords);
            setLocation(area);
            setLocationStatus(t('location_found'));
            setLocationWarning(null);
        } catch (err) {
             setLocationStatus(null);
        }
    });

    map.on('click', async function(e) {
        marker.setLatLng(e.latlng);
        const newCoords = { latitude: e.latlng.lat, longitude: e.latlng.lng };
        setCoordinates(newCoords);
        setLocationStatus(t('location_fetching_area'));
        try {
            const area = await reverseGeocode(newCoords);
            setLocation(area);
            setLocationStatus(t('location_found'));
            setLocationWarning(null);
        } catch (err) {
             setLocationStatus(null);
        }
    });

    return () => {
        map.remove();
        mapInstanceRef.current = null;
    };
  }, [t]);

  useEffect(() => {
    if (coordinates && mapInstanceRef.current && markerInstanceRef.current) {
        const { latitude, longitude } = coordinates;
        const currentLatLng = markerInstanceRef.current.getLatLng();
        if (Math.abs(currentLatLng.lat - latitude) > 0.0001 || Math.abs(currentLatLng.lng - longitude) > 0.0001) {
            markerInstanceRef.current.setLatLng([latitude, longitude]);
            mapInstanceRef.current.setView([latitude, longitude], 16);
        }
    }
  }, [coordinates]);
  
  const triggerAIAnalysis = useCallback((text: string, file: File | null) => {
    if (analysisTimeoutRef.current) clearTimeout(analysisTimeoutRef.current);

    if (!file && text.trim().length < 15) {
        setIsAnalyzing(false);
        setAiAnalysis(null);
        return;
    }
    
    setIsAnalyzing(true);
    analysisTimeoutRef.current = window.setTimeout(() => {
        assessAnimalPriority(text, reportType, file)
          .then(setAiAnalysis)
          .catch(err => {
              console.error(err);
              setAiAnalysis({ priority: 'Manual Review', justification: 'Analysis failed.' });
          })
          .finally(() => setIsAnalyzing(false));
    }, file ? 100 : 1000);
  }, [reportType]);

  useEffect(() => {
    triggerAIAnalysis(description, mediaFile);
  }, [description, mediaFile, triggerAIAnalysis]);


  const reportTypeTitles: Record<ReportType, string> = {
    [ReportType.Emergency]: t('report_type_emergency'),
    [ReportType.Abuse]: t('report_type_abuse'),
    [ReportType.MissingPet]: t('report_type_missing_pet'),
    [ReportType.FoundPet]: t('report_type_found_pet'),
    [ReportType.Sterilization]: t('report_type_sterilization'),
  };

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > FILE_SIZE_LIMIT_BYTES) {
        setMediaError(`File is too large. Please upload a file smaller than ${FILE_SIZE_LIMIT_MB}MB.`);
        setMediaFile(null);
        setMediaPreview(null);
        return;
      }
      
      // Clear previous errors as soon as a valid file is selected
      setMediaError(null);
      setSubmissionError(null);

      const isImage = file.type.startsWith('image/');
      setMediaFile(file);
      
      if (mediaPreview) URL.revokeObjectURL(mediaPreview);
      setMediaPreview(URL.createObjectURL(file));

      if (isImage) {
        triggerAIAnalysis(description, file);
      } else {
        if (analysisTimeoutRef.current) clearTimeout(analysisTimeoutRef.current);
        setIsAnalyzing(false);
        setAiAnalysis(null);
      }
    }
  };

  const handleGetLocation = useCallback(async () => {
    setIsLocating(true);
    setLocationError(null);
    setLocationWarning(null);
    try {
      setLocationStatus(t('location_fetching_coords'));
      const coords = await getCurrentLocation();
      setCoordinates(coords);
      
      const distLat = Math.abs(coords.latitude - DEFAULT_CENTER.latitude);
      const distLng = Math.abs(coords.longitude - DEFAULT_CENTER.longitude);
      
      if (distLat > 0.5 || distLng > 0.5) {
        setLocationWarning(t('location_warning_outside_area'));
      }
      
      setLocationStatus(t('location_fetching_area'));
      const areaName = await reverseGeocode(coords);
      setLocation(areaName);
      setLocationStatus(t('location_found'));

    } catch (error: any) {
      setLocationError(error.message);
      setLocationStatus(null);
    } finally {
      setIsLocating(false);
    }
  }, [t]);

  const handleManualLocationSearch = async () => {
      if (!location.trim()) return;
      setIsLocating(true);
      setLocationError(null);
      setLocationWarning(null);
      
      try {
          setLocationStatus(t('location_refining'));
          const refinedLocation = await refineLocationQuery(location);
          if (refinedLocation !== location) setLocation(refinedLocation); 

          setLocationStatus(t('location_searching'));
          let result = await forwardGeocode(refinedLocation);
          if (!result && refinedLocation !== location) result = await forwardGeocode(location);
          
          if (result) {
              setCoordinates(result.coords);
              setLocationStatus(t('location_found'));
          } else {
              setLocationError(t('location_search_error'));
              setLocationStatus(null);
          }
      } catch (error) {
          setLocationError(t('location_search_error'));
          setLocationStatus(null);
      } finally {
          setIsLocating(false);
      }
  };
  
  const handleResetLocation = () => {
      setCoordinates(DEFAULT_CENTER);
      setLocation('');
      setLocationStatus(null);
      setLocationWarning(null);
      setLocationError(null);
      if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([DEFAULT_CENTER.latitude, DEFAULT_CENTER.longitude], 13);
      }
  };

  const handleLocationInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setLocation(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmissionError(null);

    if (!mediaFile || !coordinates) {
        if (!mediaFile) setMediaError("Media file is required.");
        if (!coordinates) setLocationError("Please set a location on the map.");
        return;
    }
    
    setIsSubmitting(true);
    setMediaError(null);
    
    const formData = new FormData();
    formData.append('type', reportType);
    formData.append('description', description);
    formData.append('location', location);
    formData.append('reporterName', reporterName);
    formData.append('reporterPhone', reporterPhone);
    formData.append('coordinates', JSON.stringify(coordinates));
    formData.append('aiPriority', aiAnalysis?.priority || 'Manual Review');
    formData.append('aiJustification', aiAnalysis?.justification || 'N/A');
    formData.append('media', mediaFile);

    try {
        const response = await fetch(`${API_BASE_URL}/api/reports`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            let errorMessage = 'Failed to submit report.';
             try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorMessage;
            } catch {
                errorMessage = 'Cannot connect to the server. Please check your backend and CORS configuration.';
            }
            throw new Error(errorMessage);
        }

        const PHONE_NUMBER = '919845255777';
        const googleMapsLink = `https://www.google.com/maps?q=${coordinates.latitude},${coordinates.longitude}`;
        const whatsappMessage = `
--- INCIDENT REPORT ---
*Type:* ${reportTypeTitles[reportType]}
*Name:* ${reporterName}
*Phone:* ${reporterPhone}
*Location:* ${location}
*Map Link:* ${googleMapsLink}
*Description:*
${description}
--- AI ASSESSMENT ---
*Priority:* ${aiAnalysis?.priority || 'Manual Review'}
*Justification:* ${aiAnalysis?.justification || 'N/A'}
*Please remember to attach the photo/video for this report.*
        `.trim().replace(/^\s+/gm, '');

        const url = `https://wa.me/${PHONE_NUMBER}?text=${encodeURIComponent(whatsappMessage)}`;
        setWhatsappUrl(url);
        setIsSubmitted(true);

    } catch (err: any) {
        setSubmissionError(err.message || "An unexpected error occurred.");
    } finally {
        setIsSubmitting(false);
    }
  };

  const getPriorityColorClass = (priority: string) => {
    const p = priority.toLowerCase();
    if (p === 'high' || p === 'critical') return 'bg-red-100 border-red-500';
    if (p === 'medium' || p === 'moderate') return 'bg-yellow-100 border-yellow-500';
    if (p === 'low' || p === 'minor') return 'bg-green-100 border-green-500';
    if (p === 'info') return 'bg-blue-100 border-blue-500';
    return 'bg-slate-100 border-slate-400';
  };

  const getPriorityTextColorClass = (priority: string) => {
    const p = priority.toLowerCase();
    if (p === 'high' || p === 'critical') return 'text-red-700';
    if (p === 'medium' || p === 'moderate') return 'text-yellow-700';
    if (p === 'low' || p === 'minor') return 'text-green-700';
    if (p === 'info') return 'text-blue-700';
    return 'text-slate-700';
  };
  
  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <Card className="p-8 bg-green-100 border-l-4 border-green-500">
          <h2 className="text-2xl font-bold text-green-800">Report Ready to Send!</h2>
          <p className="mt-2 text-green-700">Next, please send the report to our team on WhatsApp for immediate action.</p>
          <p className="mt-4 text-sm font-medium text-red-600 bg-red-100 p-2 rounded-md">{t('report_ready_attach_media')}</p>
          <button
             onClick={() => { if (whatsappUrl) window.location.href = whatsappUrl; }}
             disabled={!whatsappUrl}
             className="mt-6 inline-block w-full justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
          >
            {t('report_ready_cta')}
          </button>
          <button
             onClick={() => navigate('/')}
             className="mt-4 text-sm text-gray-600 hover:underline"
          >
            Back to Home
          </button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold font-serif text-text-primary">{reportTypeTitles[reportType]}</h1>
        <p className="mt-2 text-text-secondary">Please provide as much detail as possible.</p>
      </div>
      <Card>
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div>
                <h3 className="text-lg font-medium text-text-primary mb-4">{t('report_contact_details')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                    <label htmlFor="reporterName" className="block text-sm font-medium text-text-primary">
                        {t('report_your_name')}
                    </label>
                    <input
                        type="text"
                        id="reporterName"
                        value={reporterName}
                        onChange={(e) => setReporterName(e.target.value)}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 text-text-primary placeholder-gray-500 shadow-sm focus:border-brand-primary focus:ring-brand-primary sm:text-sm"
                        placeholder="Your Full Name"
                    />
                    </div>
                    <div>
                    <label htmlFor="reporterPhone" className="block text-sm font-medium text-text-primary">
                        {t('report_your_phone')}
                    </label>
                    <input
                        type="tel"
                        id="reporterPhone"
                        value={reporterPhone}
                        onChange={(e) => setReporterPhone(e.target.value)}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 text-text-primary placeholder-gray-500 shadow-sm focus:border-brand-primary focus:ring-brand-primary sm:text-sm"
                        placeholder="Your Contact Number"
                    />
                    </div>
                </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <label htmlFor="description" className="block text-sm font-medium text-text-primary">
                Description
              </label>
              <textarea
                id="description"
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 text-text-primary placeholder-gray-500 shadow-sm focus:border-brand-primary focus:ring-brand-primary sm:text-sm"
                placeholder="Describe the situation, animal's condition, etc."
              />
            </div>
            
            <div>
              <label htmlFor="media-upload" className="block text-sm font-medium text-text-primary">
                {t('report_form_media_label')}
              </label>
              <div className="mt-1 flex justify-center rounded-md border-2 border-dashed border-gray-300 px-6 pt-5 pb-6">
                <div className="space-y-1 text-center">
                  {mediaPreview && mediaFile?.type.startsWith('image/') ? (
                    <img src={mediaPreview} alt="Preview" className="mx-auto h-32 w-auto rounded-md object-cover" />
                  ) : mediaPreview && mediaFile?.type.startsWith('video/') ? (
                    <video src={mediaPreview} controls className="mx-auto h-32 w-auto rounded-md" />
                  ) : (
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="media-upload"
                      className="relative cursor-pointer rounded-md bg-white font-medium text-brand-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-brand-primary focus-within:ring-offset-2 hover:text-indigo-500"
                    >
                      <span>{t('report_form_media_cta')}</span>
                      <input id="media-upload" name="media-upload" type="file" className="sr-only" accept="image/*,video/*" onChange={handleMediaChange} />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">{t('report_form_media_info')}</p>
                </div>
              </div>
              {mediaFile && !mediaFile.type.startsWith('image/') && (
                  <p className="mt-2 text-xs text-orange-600">{t('report_form_ai_video_skip')}</p>
              )}
              {mediaError && <p className="mt-2 text-sm text-red-600">{mediaError}</p>}
            </div>

            {isAnalyzing && (
              <div className="text-center p-2 bg-blue-50 border-l-4 border-blue-400 rounded-r-md text-xs font-medium text-blue-700">
                AI is analyzing...
              </div>
            )}
            
            {aiAnalysis && (
                 <div className={`p-4 rounded-md border-l-4 ${getPriorityColorClass(aiAnalysis.priority)}`}>
                    <h4 className="text-sm font-bold text-text-primary">
                        AI Priority Assessment
                    </h4>
                    <p className={`text-lg font-bold mt-1 ${getPriorityTextColorClass(aiAnalysis.priority)}`}>
                        {aiAnalysis.priority}
                    </p>
                    <p className="text-sm text-text-secondary mt-1">{aiAnalysis.justification}</p>
                </div>
            )}

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-text-primary">
                Location
              </label>
              <div className="mt-1 flex flex-col sm:flex-row gap-2">
                 <div className="flex-grow flex rounded-md shadow-sm">
                    <input
                        type="text"
                        id="location"
                        value={location}
                        onChange={handleLocationInputChange}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleManualLocationSearch();
                          }
                        }}
                        className="block w-full rounded-none rounded-l-md border-gray-300 bg-gray-50 text-text-primary placeholder-gray-500 focus:border-brand-primary focus:ring-brand-primary sm:text-sm"
                        placeholder={t('report_form_location_placeholder')}
                    />
                     <button
                        type="button"
                        onClick={handleManualLocationSearch}
                        disabled={isLocating}
                        className="relative -ml-px inline-flex items-center space-x-2 rounded-r-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                        title={t('location_search_button')}
                    >
                         {isLocating ? (
                            <svg className="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                         ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                         )}
                    </button>
                 </div>
                
                <button
                    type="button"
                    onClick={handleGetLocation}
                    disabled={isLocating}
                    className="inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-text-secondary bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary whitespace-nowrap"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    My Location
                </button>
              </div>
              
              <div className="mt-3 w-full h-64 rounded-lg border border-gray-300 overflow-hidden relative z-0">
                  <div ref={mapContainerRef} id="map" className="w-full h-full"></div>
                   <button
                        type="button"
                        onClick={handleResetLocation}
                        className="absolute top-2 right-2 z-[500] bg-white border border-gray-300 rounded px-2 py-1 text-xs font-medium shadow-md hover:bg-gray-50 text-gray-700"
                        title={t('map_reset')}
                   >
                       {t('map_reset')}
                   </button>
              </div>
              <p className="mt-1 text-xs text-gray-500 text-center">{t('map_instruction')}</p>

              {coordinates && (
                  <div className="mt-2 text-left">
                      <span className="text-xs text-gray-500">Coordinates: {coordinates.latitude.toFixed(5)}, {coordinates.longitude.toFixed(5)}</span>
                  </div>
              )}
              
              {!isLocating && locationStatus && !locationError && !locationWarning && <p className="mt-2 text-sm text-green-600">{locationStatus}</p>}
              {locationWarning && <p className="mt-2 text-sm text-orange-600 font-medium">{locationWarning}</p>}
              {locationError && <p className="mt-2 text-sm text-red-600">{locationError}</p>}
            </div>
            
            {(submissionError || mediaError) && 
                <p className="text-sm text-center font-medium text-red-600">
                    {submissionError || mediaError}
                </p>
            }


            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-primary hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary disabled:opacity-50 transition-all duration-300 transform hover:scale-105"
            >
              {isSubmitting ? 'Preparing Report...' : 'Submit Report'}
            </button>
          </form>
        </div>
      </Card>
    </div>
  );
};

export default ReportForm;