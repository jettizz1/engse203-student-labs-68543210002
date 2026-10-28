function AboutPage() {
  return (
    <section data-testid="page-about">
      <div className="page-heading"><div><p className="eyebrow dark">ABOUT THE LAB</p><h1>เกี่ยวกับระบบ</h1></div></div>
      <article className="panel prose">
        <p>Campus Service Request เป็นกรณีศึกษาสำหรับเรียนรู้ React Routing, Service Layer, Express API และ SQLite persistence.</p>
        <h2>สถาปัตยกรรม</h2>
        <p>ในเครื่อง Page เรียก Express API และ API อ่าน/เขียน SQLite ผ่าน service layer. GitHub Pages ให้บริการเฉพาะ frontend static build เท่านั้น; Express และ SQLite ไม่ได้ถูก deploy หรือโฮสต์บน GitHub Pages, ส่วน demo mode ใช้ browser storage.</p>
        <h2>ความเป็นส่วนตัว</h2>
        <p>ข้อมูลใน LAB เป็นข้อมูลสาธิต ห้ามบันทึกข้อมูลส่วนบุคคลจริง รหัสผ่าน token หรือ secret.</p>
      </article>
    </section>
  );
}

export default AboutPage;
