import { useEffect, useState } from "react";
import Modal from "../../../shared/components/Modal";
import Button from "../../../shared/components/Button";
import Input from "../../../shared/components/Input";

export default function JoinGroupModal({ open, onClose, onSubmit }) {
  const [code, setCode] = useState('');

  useEffect(() => {
    if (!open) setCode('');
  }, [open]);

  if (!open) return null;

  return (
    <Modal open={open} onClose={onClose} title="Tham gia nhóm bằng mã">
      <div className="space-y-3">
        <Input placeholder="Nhập mã nhóm" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} />
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>Hủy</Button>
          <Button onClick={() => onSubmit(code)} disabled={!code.trim()}>Tham gia</Button>
        </div>
      </div>
    </Modal>
  );
}
