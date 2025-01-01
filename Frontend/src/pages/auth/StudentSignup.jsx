import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import axios from "axios";

const StudentSignup = () => {
  const navigate = useNavigate(); // Initialize useNavigate
  const [isStudent, setIsStudent] = useState(true);
  const [formData, setFormData] = useState({
    first_Name: "",
    last_Name: "",
    gender: "",
    date_of_birth: "",
    phone_number: "",
    email: "",
    password: "",
    confirm_password: "",
    state_of_residence: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent the default form submission behavior

    try {
      // Send form data to the backend (MongoDB)
      const response = await axios.post(
        "http://localhost:5005/api/auth/student-signup",
        formData
      );

      // Check if the response indicates success
      if (response.status === 200) {
        console.log(response.data); // The response from the backend
        alert("Account setup successful!"); // Show a success message
      } else {
        navigate("/dashboard");
        /*alert(
          "There was an issue with the account setup. Please try again."
        );*/
      }
    } catch (error) {
      console.error("There was an error submitting the form!", error);
      alert("Error submitting form data. Please try again.");
    }
  };

  return (
    <div className="h-screen w-screen bg-[#EFF6FF] p-3 flex">
        {/* Left Side */}
        <div
            className={`w-[434px] h-full rounded-xl transition-all duration-1000 ease-in-out ${
                isStudent ? "bg-primary" : "bg-[#1F479A]"
            }`}
        ></div>

        {/* Right Side */}
        <div className="h-full w-full flex flex-col justify-center items-center">
            {/* Button to switch between Student and Company */}
            <div className="bg-white rounded-full shadow-lg p-1 flex gap-1">
                <button
                    className={`px-16 py-4 rounded-full transition-all duration-500 ease-in-out ${
                        isStudent ? "bg-primary text-white" : "bg-[#F6F6F6] text-gray-600"
                    }`}
                    onClick={() => setIsStudent(true)}
                >
                    I&apos;m a Student
                </button>
                <button
                    className={`px-16 py-4 rounded-full transition-all duration-500 ease-in-out ${
                        !isStudent ? "bg-[#1F479A] text-white" : "bg-[#F6F6F6] text-gray-600"
                    }`}
                    onClick={() => setIsStudent(false)}
                >
                    I&apos;m a Company
                </button>
            </div>

            {/* Student Signup Form */}
            <form className="mt-8 flex flex-col gap-4" onSubmit={handleSubmit}>
                {/* Name Fields */}
                <div className="flex gap-4">
                    <div className="flex flex-col gap-1">
                        <label className="text-sm text-gray-600">First Name</label>
                        <input
                            type="text"
                            className="px-4 py-2 rounded-xl border border-[#BCC3D0] w-[232px]"
                            placeholder="John"
                            name="first_Name"
                            value={formData.first_Name}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-sm text-gray-600">Last Name</label>
                        <input
                            type="text"
                            className="px-4 py-2 rounded-xl border border-[#BCC3D0] w-[232px]"
                            placeholder="Doe"
                            name="last_Name"
                            value={formData.last_Name}
                            onChange={handleInputChange}
                        />
                    </div>
                </div>

                {/* Email Field */}
                <div className="flex flex-col gap-1">
                    <label className="text-sm text-gray-600">Email</label>
                    <input
                        type="email"
                        className="px-4 py-2 rounded-xl border border-[#BCC3D0] w-[476px]"
                        placeholder="johndoe@example.com"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                    />
                </div>

                {/* Phone Number and Date of Birth */}
                <div className="flex gap-4">
                    <div className="flex flex-col gap-1">
                        <label className="text-sm text-gray-600">Phone Number</label>
                        <input
                            type="text"
                            className="px-4 py-2 rounded-xl border border-[#BCC3D0] w-[232px]"
                            placeholder="+91 1234567890"
                            name="phone_number"
                            value={formData.phone_number}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-sm text-gray-600">Date of Birth</label>
                        <input
                            type="text"
                            className="px-4 py-2 rounded-xl border border-[#BCC3D0] w-[232px]"
                            placeholder="01-01-2000"
                            name="date_of_birth"
                            value={formData.date_of_birth}
                            onChange={handleInputChange}
                        />
                    </div>
                </div>

                {/* Gender and State of Residence */}
                <div className="flex gap-4">
                    <div className="flex flex-col gap-1">
                        <label className="text-sm text-gray-600">Gender</label>
                        <select
                            className="px-4 py-2 rounded-xl border border-[#BCC3D0] w-[232px]"
                            name="gender"
                            value={formData.gender}
                            onChange={handleInputChange}
                        >
                            <option value="" disabled>
                                Select gender
                            </option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-sm text-gray-600">State of Residence</label>
                        <select
                            className="px-4 py-2 rounded-xl border border-[#BCC3D0] w-[232px]"
                            name="state_of_residence"
                            value={formData.state_of_residence}
                            onChange={handleInputChange}
                        >
                            <option value="" disabled>
                                Select state
                            </option>
                            {/* Add other state options */}
                            <option value="delhi">Delhi</option>
                            <option value="maharashtra">Maharashtra</option>
                        </select>
                    </div>
                </div>

                {/* Password Fields */}
                <div className="flex gap-4">
                    <div className="flex flex-col gap-1">
                        <label className="text-sm text-gray-600">Password</label>
                        <input
                            type="password"
                            className="px-4 py-2 rounded-xl border border-[#BCC3D0] w-[232px]"
                            placeholder="••••••••"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-sm text-gray-600">Confirm Password</label>
                        <input
                            type="password"
                            className="px-4 py-2 rounded-xl border border-[#BCC3D0] w-[232px]"
                            placeholder="••••••••"
                            name="confirm_password"
                            value={formData.confirm_password}
                            onChange={handleInputChange}
                        />
                    </div>
                </div>

                <button className="w-[476px] bg-primary rounded-xl py-2.5 text-white mt-4">
                    Sign Up
                </button>
            </form>
        </div>
    </div>
);
};

export default StudentSignup;
