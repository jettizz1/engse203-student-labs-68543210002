import AppHeader from './components/AppHeader.jsx';
import SummaryPanel from './components/SummaryPanel.jsx';
import RequestForm from './components/RequestForm.jsx';
import FilterBar from './components/FilterBar.jsx';
import RequestList from './components/RequestList.jsx';
import { useState } from 'react';
import { initialRequests } from './data/initialRequests.js';

function App() {
  // TODO LAB4-R04: เปลี่ยน requests/statusFilter เป็น state
  const [requests, setRequests] = useState(initialRequests);
  const [statusFilter, setStatusFilter] = useState('all');

  // TODO LAB4-R04: คำนวณ summary เป็น derived data
  const summary = {
    total: requests.length,
    pending: requests.filter((request) => request.status === 'pending').length,
    inProgress: requests.filter((request) => request.status === 'in-progress').length,
    completed: requests.filter((request) => request.status === 'completed').length,
  };

  // TODO LAB4-R08: คำนวณ filteredRequests จาก requests + statusFilter
  const filteredRequests =
    statusFilter === 'all'
      ? requests
      : requests.filter((request) => request.status === statusFilter);

  function handleAddRequest(requestData) {
    const newRequest = {
      ...requestData,
      id: 'REQ-' + (requests.length + 1),
      status: 'pending',
    };

    setRequests((previousRequests) => [newRequest, ...previousRequests]);
  }

  function handleDeleteRequest(requestId) {
    setRequests((previousRequests) =>
      previousRequests.filter((request) => request.id !== requestId)
    );
  }

  return (
    <>
      <AppHeader
        title="Campus Service Request"
        subtitle="Lab 4 — React Components, Props, State และ Events"
      />
      <main className="container page-content">
        <SummaryPanel summary={summary} />
        <div className="workspace-grid">
          <RequestForm onAddRequest={handleAddRequest} />
          <section className="panel" aria-labelledby="request-list-title">
            <div className="section-heading">
              <h2 id="request-list-title">รายการคำร้อง</h2>
              <FilterBar value={statusFilter} onFilterChange={setStatusFilter} />
            </div>
            <RequestList
              requests={filteredRequests}
              onDeleteRequest={handleDeleteRequest}
            />
          </section>
        </div>
      </main>
    </>
  );
}

export default App;

