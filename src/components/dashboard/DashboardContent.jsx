'use client';

import StudentOverview  from "./views/StudentOverview";
import AdminOverview    from "./views/AdminOverview";
import StudentPayments  from "./views/StudentPayments";
import AdminPayments    from "./views/AdminPayments";
import ResourcesView    from "./views/ResourcesView";
import StudentLoans     from "./views/StudentLoans";
import AdminLoans       from "./views/AdminLoans";
import StudentSettings  from "./views/StudentSettings";
import AdminSettings    from "./views/AdminSettings";
import AdminStudents    from "./views/AdminStudents";
import NewsView         from "./views/NewsView";
import AdminNews        from "./views/AdminNews";
import LibraryUpdates   from "./views/LibraryUpdates";
import AdminPackages    from "./views/AdminPackages";
import AdminCommunityNotes from "./views/AdminCommunityNotes";
import FocusSprintView     from "./views/FocusSprintView";
import AdminDesks          from "./views/AdminDesks";
import DailyGamePage       from "../../views/DailyGamePage";

export default function DashboardContent({ view, setView }) {
  switch (view) {
    case "overview":         return <StudentOverview  setView={setView} />;
    case "overview_admin":   return <AdminOverview    setView={setView} />;
    case "payments":         return <StudentPayments />;
    case "payments_admin":   return <AdminPayments />;
    case "packages_admin":   return <AdminPackages />;
    case "community_notes_admin": return <AdminCommunityNotes />;
    case "desks_admin":      return <AdminDesks />;
    case "focus_sprint":     return <FocusSprintView setView={setView} isAdmin={false} />;
    case "focus_sprint_admin": return <FocusSprintView setView={setView} isAdmin={true} />;
    case "scholar_path":     return <DailyGamePage setPage={setView} />;
    case "resources":        return <ResourcesView isAdmin={false} />;
    case "resources_admin":  return <ResourcesView isAdmin={true}  />;
    case "loans":            return <StudentLoans />;
    case "loans_admin":      return <AdminLoans />;
    case "Settings":         return <StudentSettings />;
    case "Settings_admin":   return <AdminSettings />;
    case "users_admin":      return <AdminStudents />;
    case "news":             return <NewsView />;
    case "news_admin":       return <AdminNews />;
    case "library_updates":  return <LibraryUpdates />;
    default:                 return null;
  }
}
