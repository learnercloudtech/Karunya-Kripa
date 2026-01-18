import React, { useState, useEffect } from 'react';
import { useLocalization } from '../context/LocalizationContext';
import Card from '../components/Card';
import { Case, Volunteer } from '../types';
import { API_BASE_URL } from '../lib/config';
import VideoThumbnail from '../components/VideoThumbnail';

const MediaViewerModal = ({ media, onClose }: { media: { url: string, type: string }, onClose: () => void }) => (
  <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[100]" onClick={onClose}>
    <div className="bg-white p-2 rounded-lg max-w-3xl max-h-[90vh] relative" onClick={e => e.stopPropagation()}>
      <button onClick={onClose} className="absolute -top-3 -right-3 bg-white rounded-full p-1.5 text-black shadow-lg hover:bg-gray-200 transition-colors z-10">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      {media.type === 'image' ? (
        <img src={media.url} alt="Incident Report Media" className="max-w-full max-h-[85vh] object-contain rounded" />
      ) : (
        <video src={media.url} controls autoPlay className="max-w-full max-h-[85vh] rounded">Your browser does not support the video tag.</video>
      )}
    </div>
  </div>
);

const AdminDashboard: React.FC = () => {
    const { t } = useLocalization();
    const [cases, setCases] = useState<Case[]>([]);
    const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedMedia, setSelectedMedia] = useState<{url: string; type: 'image' | 'video'} | null>(null);

    useEffect(() => {
      const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
          const [reportsResponse, volunteersResponse] = await Promise.all([
            fetch(`${API_BASE_URL}/api/reports`),
            fetch(`${API_BASE_URL}/api/volunteers`)
          ]);

          if (!reportsResponse.ok || !volunteersResponse.ok) {
            throw new Error('Failed to fetch data. Is the backend server running?');
          }

          const reportsData = await reportsResponse.json();
          const volunteersData = await volunteersResponse.json();
          
          setCases(reportsData);
          setVolunteers(volunteersData);

        } catch (err: any) {
          setError(err.message);
          console.error("Fetch error:", err);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }, []);

    const handleStatusChange = async (caseId: string, newStatus: Case['status']) => {
        const originalCases = [...cases];
        const updatedCases = cases.map(c => 
            c._id === caseId ? { ...c, status: newStatus } : c
        );
        setCases(updatedCases);

        try {
            const response = await fetch(`${API_BASE_URL}/api/reports/${caseId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!response.ok) {
                throw new Error('Failed to update status on the server.');
            }
        } catch (err) {
            setCases(originalCases);
            alert('Could not update status. Please check the backend server and try again.');
            console.error("Status update error:", err);
        }
    };

    const getStatusClass = (status: Case['status']) => {
        switch(status) {
            case 'Open': return 'bg-blue-100 text-blue-800 border-blue-300';
            case 'In Progress': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            case 'Resolved': return 'bg-green-100 text-green-800 border-green-300';
            case 'Escalated': return 'bg-red-100 text-red-800 border-red-300';
            default: return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };
    
    const getPriorityClass = (priority: Case['aiPriority']) => {
        switch(priority) {
            case 'High': return 'border-red-500 text-red-700';
            case 'Medium': return 'border-yellow-500 text-yellow-700';
            case 'Low': return 'border-green-500 text-green-700';
            case 'Manual Review':
            default: return 'border-gray-400 text-gray-700';
        }
    }

    const renderReportsContent = () => {
        if (cases.length === 0) {
            return <p className="text-center py-10 text-gray-500">No incident reports found. Submit a report to see it here.</p>;
        }
        return (
            <Card className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Case Details</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Media</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">AI Assessment</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Status</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {cases.map((caseItem) => (
                            <tr key={caseItem._id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap align-top">
                                    <div className="text-sm font-semibold text-text-primary">{caseItem._id.slice(-6).toUpperCase()} - <span className="font-medium text-text-secondary capitalize">{caseItem.type.replace(/_/g, ' ')}</span></div>
                                    <div className="text-sm text-text-secondary mt-1">{caseItem.reporterName} ({caseItem.reporterPhone})</div>
                                    <div className="text-sm text-text-secondary mt-1 max-w-xs whitespace-pre-wrap">{caseItem.description}</div>
                                    <a href={`https://www.google.com/maps?q=${caseItem.coordinates.latitude},${caseItem.coordinates.longitude}`} target="_blank" rel="noopener noreferrer" className="text-sm text-brand-primary hover:underline mt-1 inline-flex items-center gap-1">
                                        {caseItem.location}
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 001.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" /><path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" /></svg>
                                    </a>
                                    <div className="text-xs text-gray-400 mt-2">{new Date(caseItem.submittedAt).toLocaleString()}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap align-top">
                                    <div 
                                        onClick={() => setSelectedMedia({ url: caseItem.mediaUrl, type: caseItem.mediaType })}
                                        className="w-24 h-24 rounded-md bg-gray-200 cursor-pointer hover:opacity-80 transition-opacity flex items-center justify-center relative overflow-hidden"
                                    >
                                        {caseItem.mediaType === 'image' ? (
                                            <img src={caseItem.mediaUrl} alt="Report Media" className="w-full h-full object-cover" />
                                        ) : (
                                            <>
                                                <VideoThumbnail src={caseItem.mediaUrl} />
                                                <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center pointer-events-none">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 20 20" fill="currentColor">
                                                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap align-top">
                                    <div className={`p-2 rounded-md border-l-4 ${getPriorityClass(caseItem.aiPriority)}`}>
                                        <div className="text-sm font-bold">{caseItem.aiPriority}</div>
                                        <div className="text-xs text-text-secondary mt-1">{caseItem.aiJustification}</div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap align-top text-sm font-medium">
                                   <select 
                                     value={caseItem.status}
                                     onChange={(e) => handleStatusChange(caseItem._id, e.target.value as Case['status'])}
                                     className={`text-sm font-semibold rounded-full px-3 py-1 border ${getStatusClass(caseItem.status)} focus:ring-2 focus:ring-brand-primary focus:outline-none appearance-none`}
                                   >
                                       <option value="Open">Open</option>
                                       <option value="In Progress">In Progress</option>
                                       <option value="Resolved">Resolved</option>
                                       <option value="Escalated">Escalated</option>
                                   </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>
        );
    };

    const renderVolunteersContent = () => {
      if (volunteers.length === 0) {
          return <p className="text-center py-10 text-gray-500">No volunteers have registered yet.</p>;
      }
      return (
          <Card className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                      <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Name</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Contact</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Interests</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Registered On</th>
                      </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                      {volunteers.map((volunteer) => (
                          <tr key={volunteer._id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm font-medium text-text-primary">{volunteer.name}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-text-secondary">{volunteer.email}</div>
                                  <div className="text-sm text-gray-500">{volunteer.phone}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-text-secondary max-w-xs flex flex-wrap gap-1">
                                    {volunteer.interests.length > 0 ? volunteer.interests.map(interest => (
                                      <span key={interest} className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800">
                                        {interest}
                                      </span>
                                    )) : <span className="text-xs text-gray-400">N/A</span>}
                                  </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {new Date(volunteer.registeredAt).toLocaleDateString()}
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </Card>
      );
  };

    return (
        <div>
            {selectedMedia && <MediaViewerModal media={selectedMedia} onClose={() => setSelectedMedia(null)} />}
            <h1 className="text-3xl font-bold font-serif mb-8 text-text-primary">{t('admin_dashboard_title')}</h1>
            
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <Card className="p-6">
                    <h3 className="text-text-secondary">{t('kpi_cases_resolved')}</h3>
                    <p className="text-4xl font-bold mt-2 text-text-primary">{cases.filter(c => c.status === 'Resolved').length}</p>
                </Card>
                <Card className="p-6">
                    <h3 className="text-text-secondary">{t('kpi_active_volunteers')}</h3>
                    <p className="text-4xl font-bold mt-2 text-text-primary">{volunteers.length}</p>
                </Card>
                <Card className="p-6">
                    <h3 className="text-text-secondary">{t('kpi_donations')}</h3>
                    <p className="text-4xl font-bold mt-2 text-text-primary">₹55K</p>
                </Card>
            </section>

            <section className="mb-12">
                <h2 className="text-2xl font-bold font-serif mb-4 text-text-primary">Recent Incident Reports</h2>
                {loading ? <p className="text-center py-10">Loading...</p> : error ? <p className="text-center py-10 text-red-600 font-medium">Error: {error}</p> : renderReportsContent()}
            </section>
            
            <section>
                <h2 className="text-2xl font-bold font-serif mb-4 text-text-primary">Registered Volunteers</h2>
                {loading ? <p className="text-center py-10">Loading...</p> : error ? <p className="text-center py-10 text-red-600 font-medium">Error: {error}</p> : renderVolunteersContent()}
            </section>
        </div>
    );
};

export default AdminDashboard;