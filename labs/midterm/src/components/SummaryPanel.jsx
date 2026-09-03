const items = [
  ['total', 'ทั้งหมด'],
  ['pending', 'รอดำเนินการ'],
  ['inProgress', 'กำลังดำเนินการ'],
  ['completed', 'เสร็จสิ้น'],
];

function SummaryPanel({ summary }) {
  return (
    <section className="summary-grid" aria-label="สรุปคำร้อง">
      {items.map(([key, label]) => (
        /* เติม key={key} เข้าไปที่แท็ก <article> ตรงนี้ครับ */
        <article key={key} className="summary-card">
          <span>{label}</span>
          <strong>{summary[key]}</strong>
        </article>
      ))}
    </section>
  );
}

export default SummaryPanel;