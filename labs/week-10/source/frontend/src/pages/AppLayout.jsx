import { Outlet } from 'react-router-dom';
import AppHeader from '../components/AppHeader.jsx';
import { DEMO_MODE } from '../services/requestService.js';

function AppLayout() {
  return (
    <div className="app-shell" data-testid="app-layout">
      <AppHeader />
      {DEMO_MODE && (
        <div className="container deployment-notice" role="status">
          Pages demo: ข้อมูลบันทึกใน browser เท่านั้น · การเชื่อมต่อฐานข้อมูล SQLite ต้องรัน API แยกต่างหาก
        </div>
      )}
      <main className="container page-content" id="main-content">
        <Outlet />
      </main>
      <footer className="site-footer"><div className="container">LAB 10 · {DEMO_MODE ? 'Static Pages demo · local browser storage' : 'API + SQLite'} · ไม่ใช้ข้อมูลส่วนบุคคลจริง</div></footer>
    </div>
  );
}

export default AppLayout;
