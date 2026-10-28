import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ErrorState from '../components/ErrorState.jsx';
import LoadingState from '../components/LoadingState.jsx';
import { getRequestById } from '../services/requestService.js';

function RequestDetailPage() {
  const { requestId } = useParams();
  const [request, setRequest] = useState(null);
  const [loadState, setLoadState] = useState('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    setLoadState('loading');
    setErrorMessage('');
    setRequest(null);

    getRequestById(requestId)
      .then((result) => {
        if (cancelled) return;
        setRequest(result);
        setLoadState('success');
      })
      .catch((error) => {
        if (cancelled) return;
        setErrorMessage(error instanceof Error ? error.message : 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ');
        setLoadState('error');
      });

    return () => {
      cancelled = true;
    };
  }, [requestId, retryKey]);

  return (
    <section data-testid="page-request-detail">
      <div className="page-heading">
        <div>
          <p className="eyebrow dark">REQUEST DETAIL</p>
          <h1>รายละเอียดคำร้อง</h1>
          <p>รหัสคำร้อง: {requestId}</p>
        </div>
        <Link className="button secondary inline" to="/">กลับ Dashboard</Link>
      </div>

      {loadState === 'loading' && <LoadingState />}
      {loadState === 'error' && (
        <ErrorState message={errorMessage} onRetry={() => setRetryKey((current) => current + 1)} />
      )}
      {loadState === 'success' && !request && (
        <section className="state-card" data-testid="request-not-found">
          <h2>ไม่พบคำร้อง</h2>
          <p>ไม่พบคำร้องหมายเลข {requestId}</p>
          <Link className="button primary inline" to="/">กลับ Dashboard</Link>
        </section>
      )}
      {loadState === 'success' && request && (
        <article className="panel detail-card" data-testid="request-detail">
          <p className="request-id">{request.id}</p>
          <dl>
            <div><dt>ชื่อผู้แจ้ง</dt><dd>{request.requesterName}</dd></div>
            <div><dt>ประเภทคำร้อง</dt><dd>{request.requestType}</dd></div>
            <div><dt>สถานที่</dt><dd>{request.location}</dd></div>
            <div><dt>รายละเอียด</dt><dd>{request.details}</dd></div>
            <div><dt>ความเร่งด่วน</dt><dd>{request.priority}</dd></div>
            <div>
              <dt>สถานะ</dt>
              <dd><span className={`badge ${request.status}`}>{request.status}</span></dd>
            </div>
          </dl>
        </article>
      )}
    </section>
  );
}

export default RequestDetailPage;
