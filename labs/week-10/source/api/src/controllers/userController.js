import * as service from '../services/requestService.js';

export function listUsers(req, res) {
  res.status(200).json(service.findAllUsers());
}

export function listUserRequests(req, res) {
  const requests = service.findUserRequests(req.params.id);
  if (requests === null) {
    return res.status(404).json({ error: `ไม่พบผู้ใช้รหัส ${req.params.id}` });
  }
  res.status(200).json(requests);
}
