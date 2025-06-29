import { useAuth } from "../../contexts/AuthContext";

const ProfessionalInfoPage = () => {
  const { formData } = useAuth();
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Professional Information</h2>
      <div>Profession: {formData.profession}</div>
      <div>Experience: {formData.experience}</div>
      {/* Add more fields as needed */}
      <p className="text-gray-500 mt-4">This information is view-only and cannot be edited after submission.</p>
    </div>
  );
};

export default ProfessionalInfoPage;