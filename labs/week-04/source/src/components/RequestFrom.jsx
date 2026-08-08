import { useState } from 'react';

const initialFormData = {
  requesterName: '',
  requestType: '',
  location: '',
  details: '',
  priority: 'normal',
};

function RequestForm({ onAddRequest }) {
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [feedback, setFeedback] = useState('');

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((previousData) => ({ ...previousData, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    // TODO LAB4-R05–R07: validate controlled state แล้วเรียก onAddRequest

    const nextErrors = {};

    if (formData.requesterName.trim().length < 2) {
      nextErrors.requesterName = 'ชื่อผู้แจ้งต้องมีอย่างน้อย 2 ตัวอักษร';
    }
    if (!formData.requestType) {
      nextErrors.requestType = 'กรุณาเลือกประเภทคำร้อง';
    }
    if (!formData.location.trim()) {
      nextErrors.location = 'กรุณาระบุสถานที่';
    }
    if (formData.details.trim().length < 10) {
      nextErrors.details = 'รายละเอียดต้องมีอย่างน้อย 10 ตัวอักษร';
    }
    if (formData.priority !== 'normal' && formData.priority !== 'urgent') {
      nextErrors.priority = 'ระบุความเร่งด่วนไม่ถูกต้อง';
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setFeedback('');
      return;
    }

    setErrors({});
    onAddRequest({
      requesterName: formData.requesterName.trim(),
      requestType: formData.requestType,
      location: formData.location.trim(),
      details: formData.details.trim(),
      priority: formData.priority,
    });

    setFormData(initialFormData);
    setFeedback('เพิ่มคำร้องสำเร็จแล้ว');
    setTimeout(() => setFeedback(''), 3000);
  }

  return (
    <section className="panel" aria-labelledby="request-form-title">
      <p className="eyebrow dark">CONTROLLED FORM</p>
      <h2 id="request-form-title">สร้างคำร้องใหม่</h2>
      <form onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label htmlFor="requesterName">ชื่อผู้แจ้ง</label>
          <input
            id="requesterName"
            name="requesterName"
            value={formData.requesterName}
            onChange={handleChange}
            aria-invalid={Boolean(errors.requesterName)}
          />
          <small className="error" id="requesterName-error">{errors.requesterName}</small>
        </div>

        <div className="field">
          <label htmlFor="requestType">ประเภทคำร้อง</label>
          <select
            id="requestType"
            name="requestType"
            value={formData.requestType}
            onChange={handleChange}
            aria-invalid={Boolean(errors.requestType)}
          >
            <option value="">-- เลือกประเภท --</option>
            <option value="แจ้งซ่อม">แจ้งซ่อม</option>
            <option value="ขอใช้ห้อง">ขอใช้ห้อง</option>
            <option value="บริการบัญชีผู้ใช้">บริการบัญชีผู้ใช้</option>
          </select>
          <small className="error" id="requestType-error">{errors.requestType}</small>
        </div>

        <div className="field">
          <label htmlFor="location">สถานที่</label>
          <input
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            aria-invalid={Boolean(errors.location)}
          />
          <small className="error" id="location-error">{errors.location}</small>
        </div>

        <div className="field">
          <label htmlFor="details">รายละเอียด</label>
          <textarea
            id="details"
            name="details"
            rows="4"
            value={formData.details}
            onChange={handleChange}
            aria-invalid={Boolean(errors.details)}
          />
          <small className="error" id="details-error">{errors.details}</small>
        </div>

        <fieldset className="field">
          <legend>ความเร่งด่วน</legend>
          <label>
            <input type="radio" name="priority" value="normal" checked={formData.priority === 'normal'} onChange={handleChange} />
            ปกติ
          </label>
          <label>
            <input type="radio" name="priority" value="urgent" checked={formData.priority === 'urgent'} onChange={handleChange} />
            เร่งด่วน
          </label>
          <small className="error" id="priority-error">{errors.priority}</small>
        </fieldset>

        <button type="submit">เพิ่มคำร้อง</button>
        <p className={`status ${feedback ? 'success' : ''}`} role="status" aria-live="polite">
          {feedback}
        </p>
      </form>
    </section>
  );
}

export default RequestForm;
