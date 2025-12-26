// src/pages/ProjectDashboardWrapper.jsx
import { useParams } from 'react-router-dom';
import ProjectDashboard from './ProjectDashboard';

export default function ProjectDashboardWrapper() {
  const { projectId } = useParams();
  return <ProjectDashboard projectId={projectId} />;
}
