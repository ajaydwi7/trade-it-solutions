import { useAuth } from "../../contexts/AuthContext";
import { useState } from "react";

const SettingsPage = () => {
  const { user, updateUser } = useAuth();
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [phone, setPhone] = useState(user?.phone || "");

  const handleSubmit = (e) => {
    e.preventDefault();
    updateUser({ firstName, lastName, phone });
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Update Personal Information</h2>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <div>
          <label className="block mb-1">First Name</label>
          <input className="w-full border rounded px-3 py-2" value={firstName} onChange={e => setFirstName(e.target.value)} />
        </div>
        <div>
          <label className="block mb-1">Last Name</label>
          <input className="w-full border rounded px-3 py-2" value={lastName} onChange={e => setLastName(e.target.value)} />
        </div>
        <div>
          <label className="block mb-1">Phone</label>
          <input className="w-full border rounded px-3 py-2" value={phone} onChange={e => setPhone(e.target.value)} />
        </div>
        <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded">Update</button>
      </form>
      <p className="text-gray-500 mt-4">You can only update your personal information here. Application form details are view-only.</p>
    </div>
  );
};

export default SettingsPage;