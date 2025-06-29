import { useAuth } from "../../contexts/AuthContext";

const PersonalInfoPage = () => {
  const { user } = useAuth();
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Personal Information</h2>
      <div>Name: {user?.firstName} {user?.lastName}</div>
      <div>Email: {user?.email}</div>
      <div>Phone: {user?.phone}</div>
      <div>Address: {user?.address}</div>
    </div>
  );
};

export default PersonalInfoPage;