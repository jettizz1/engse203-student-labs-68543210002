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
  const [selectedStatus, setSelectedStatus] = useState('pending');
  const [errorMessage, setErrorMessage] = useState('');
  const [notice, setNotice] = useState('');
  const [updating, setUpdating] = useState(false);
  const [reloadKey, reload] = useManualReload();

  useEffect(() => {
    let ignore = false;
    setLoadState('loading');
    getRequestById(requestId).then((result) => {
      if (ignore) return;
      setRequest(result);
      setSelectedStatus(result?.status ?? 'pending');
      setLoadState('success');
    }).catch((error) => {
      if (ignore) return;
      setErrorMessage(error instanceof Error ? error.message : 'โหลดรายละเอียดไม่สำเร็จ');
      setLoadState('error');
    });
    return () => { ignore = true; };
  }, [requestId, reloadKey]);

  async function handleStatusChange() {
    if (!request || selectedStatus === request.status) return;
    setUpdating(true);
    setNotice('');
    try {
      const updatedRequest = await updateRequestStatus(request.id, selectedStatus);
      setRequest(updatedRequest);
      setSelectedStatus(updatedRequest.status);
      setNotice('อัปเดตสถานะเรียบร้อยแล้ว');
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'อัปเดตสถานะไม่สำเร็จ');
    } finally {
      setUpdating(false);
    }
  }

  return (
    <section data-testid="page-request-detail">
      <div className="page-heading"><div><p className="eyebrow dark">DYNAMIC ROUTE</p><h1>รายละเอียดคำร้อง</h1><p>Request ID: <code>{requestId}</code></p></div></div>
      {loadState === 'loading' && <LoadingState message="กำลังโหลดรายละเอียด…" />}
      {loadState === 'error' && <ErrorState message={errorMessage} onRetry={reload} />}
      {notice && <p className="notice" role="status">{notice}</p>}
      {loadState === 'success' && !request && (
        <section className="state-card"><h2>ไม่พบคำร้อง</h2><p>ไม่พบข้อมูลสำหรับ ID <code>{requestId}</code></p><Link to="/">กลับ Dashboard</Link></section>
      )}
      {loadState === 'success' && request && (
        <article className="panel detail-card">
          <h2>{request.requestType}</h2>
          <dl><div><dt>ID</dt><dd>{request.id}</dd></div><div><dt>ผู้แจ้ง</dt><dd>{request.requesterName}</dd></div><div><dt>สถานที่</dt><dd>{request.location}</dd></div><div><dt>รายละเอียด</dt><dd>{request.details}</dd></div><div><dt>ความเร่งด่วน</dt><dd>{request.priority}</dd></div><div><dt>สถานะ</dt><dd>{request.status}</dd></div></dl>
          <div className="field">
            <label htmlFor="request-status">เปลี่ยนสถานะ</label>
            <select id="request-status" value={selectedStatus} onChange={(event) => setSelectedStatus(event.target.value)} disabled={updating}>
              <option value="pending">รอดำเนินการ</option>
              <option value="in-progress">กำลังดำเนินการ</option>
              <option value="completed">เสร็จสิ้น</option>
            </select>
            <button className="button primary" type="button" onClick={handleStatusChange} disabled={updating || selectedStatus === request.status}>
              {updating ? 'กำลังบันทึก…' : 'บันทึกสถานะ'}
            </button>
          </div>
          <Link to="/">กลับ Dashboard</Link>
        </article>
      )}
    </section>
  );
}

export default RequestDetailPage;
