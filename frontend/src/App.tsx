import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ExpressIntroGate from './components/ExpressIntroGate';
import { MusicProvider } from './contexts/MusicContext';
import MusicPlayer from './components/MusicPlayer';
import HomePage from './pages/HomePage';
import PostsPage from './pages/PostsPage';
import PostDetailPage from './pages/PostDetailPage';
import MomentsPage from './pages/MomentsPage';
import MomentDetailPage from './pages/MomentDetailPage';
import AlbumsPage, { AlbumDetailPage } from './pages/AlbumsPage';
import ProfilePage from './pages/ProfilePage';
import GuestbookPage from './pages/GuestbookPage';
import SearchPage from './pages/SearchPage';
import LoginPage from './pages/LoginPage';
import AdminPage from './pages/AdminPage';
import SquadsPage from './pages/SquadsPage';

function MainShell() {
  return (
    <ExpressIntroGate>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/posts" element={<PostsPage />} />
          <Route path="/posts/:slug" element={<PostDetailPage />} />
          <Route path="/moments" element={<MomentsPage />} />
          <Route path="/moments/:id" element={<MomentDetailPage />} />
          <Route path="/albums" element={<AlbumsPage />} />
          <Route path="/albums/:id" element={<AlbumDetailPage />} />
          <Route path="/squads" element={<SquadsPage />} />
          <Route path="/profile/:id" element={<ProfilePage />} />
          <Route path="/guestbook" element={<GuestbookPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </ExpressIntroGate>
  );
}

export default function App() {
  return (
    <MusicProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/*" element={<MainShell />} />
      </Routes>
      <MusicPlayer />
    </MusicProvider>
  );
}
