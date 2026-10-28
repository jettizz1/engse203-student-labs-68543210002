import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ErrorState from '../components/ErrorState.jsx';
import LoadingState from '../components/LoadingState.jsx';
import useManualReload from '../hooks/useManualReload.js';
import { getRequestById, updateRequestStatus } from '../services/requestService.js';

function RequestDetailPage() {
  const { requestId } = useParams();
  const [loadState, setLoadState] = useState('loading');
  const [request, setRequest] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [savingStatus, setSavingStatus] = useState(false);
  const [reloadKey, reload] = useManualReload();

  useEffect(() => {
    let ignore = false;
    setLoadState('loading');
    getRequestById(requestId).then((result) => {
      if (ignore) return;
      setRequest(result);
      setLoadState('success');
    }).catch((error) => {
      if (ignore) return;
      setErrorMessage(error instanceof Error ? error.message : 'โหลดรายละเอียดไม่สำเร็จ');
      setLoadState('error');
    });
    return () => { ignore = true; };
  }, [requestId, reloadKey]);

  async function handleStatusChange(event) {
    event.preventDefault();
    if (!request) return;
    const formData = new FormData(event.currentTarget);
    const status = formData.get('status');
    setSavingStatus(true);
    setStatusMessage('');
    try {
      const updated = await updateRequestStatus(request.id, status);
      if (updated) setRequest(updated);
      setStatusMessage('อัปเดตสถานะแล้ว');
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'อัปเดตสถานะไม่สำเร็จ');
    } finally {
      setSavingStatus(false);
    }
  }

  return (
    <section data-testid="page-request-detail">
      <div className="page-heading"><div><p className="eyebrow dark">DYNAMIC ROUTE</p><h1>รายละเอียดคำร้อง</h1><p>Request ID: <code>{requestId}</code></p></div></div>
      {loadState === 'loading' && <LoadingState message="กำลังโหลดรายละเอียด…" />}
      {loadState === 'error' && <ErrorState message={errorMessage} onRetry={reload} />}
      {loadState === 'success' && !request && (
        <section className="state-card"><h2>ไม่พบคำร้อง</h2><p>ไม่พบข้อมูลสำหรับ ID <code>{requestId}</code></p><Link to="/">กลับ Dashboard</Link></section>
      )}
      {loadState === 'success' && request && (
        <article className="panel detail-card">
          <h2>{request.requestType}</h2>
          <dl><div><dt>ID</dt><dd>{request.id}</dd></div><div><dt>ผู้แจ้ง</dt><dd>{request.requesterName}</dd></div><div><dt>สถานที่</dt><dd>{request.location}</dd></div><div><dt>รายละเอียด</dt><dd>{request.details}</dd></div><div><dt>ความเร่งด่วน</dt><dd>{request.priority}</dd></div><div><dt>สถานะ</dt><dd>{request.status}</dd></div></dl>
          <form className="status-form" onSubmit={handleStatusChange}>
            <label htmlFor="request-status">เปลี่ยนสถานะ</label>
            <select id="request-status" name="status" defaultValue={request.status}>
              <option value="pending">pending</option>
              <option value="in-progress">in-progress</option>
              <option value="completed">completed</option>
            </select>
            <button className="button primary" type="submit" disabled={savingStatus}>
              {savingStatus ? 'กำลังบันทึก…' : 'บันทึกสถานะ'}
            </button>
            {statusMessage && <p className="status" role="status">{statusMessage}</p>}
          </form>
          <Link to="/">กลับ Dashboard</Link>
        </article>
      )}
    </section>
  );
}

export default RequestDetailPage;
