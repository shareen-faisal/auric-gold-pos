import React, { useState, useEffect } from "react";
import styles from "../css/Settings.module.css";
import axios from "axios";

export default function Settings() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    oldPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [initialData, setInitialData] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [phoneNumberError, setPhoneNumberError] = useState(null);
  const [passwordMatchError, setPasswordMatchError] = useState(null);

  useEffect(() => {
    if (message || error) {
      const timer = setTimeout(() => {
        setMessage(null);
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message, error]);

  // ✅ Fetch current user info on mount
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Please log in first");

        const res = await axios.get(
          "http://localhost:5000/api/users/getUserInfo",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const user = res.data.user;
        setFormData({
          name: user.name || "",
          email: user.username || "",
          phoneNumber: user.phoneNumber || "",
          oldPassword: "",
          newPassword: "",
          confirmNewPassword: "",
        });
        setInitialData({
          name: user.name || "",
          email: user.username || "",
          phoneNumber: user.phoneNumber || "",
        });
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      }
    };

    fetchUserInfo();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const validatePhoneNumber = (number) => {
    const phoneNumberPattern = /^\d{11}$/;
    if (!number) {
      return "Phone number is required.";
    } else if (!phoneNumberPattern.test(number)) {
      return "Phone number must be exactly 11 digits.";
    }
    return null;
  };

  const validatePasswordFields = (newPass, confirmPass, oldPass) => {
    if (newPass || confirmPass) {
      if (!oldPass) {
        return "Please enter your current password to change it.";
      }
      if (!newPass) {
        return "New password is required.";
      }
      if (newPass.length < 6) {
        return "New password must be at least 6 characters long.";
      }
      if (!confirmPass) {
        return "Confirm new password is required.";
      }
      if (newPass !== confirmPass) {
        return "New password and confirm password do not match.";
      }
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);
    setPhoneNumberError(null);
    setPasswordMatchError(null);

    const phoneError = validatePhoneNumber(formData.phoneNumber);
    if (phoneError) {
      setPhoneNumberError(phoneError);
      setLoading(false);
      return;
    }

    const passwordError = validatePasswordFields(
      formData.newPassword,
      formData.confirmNewPassword,
      formData.oldPassword
    );
    if (passwordError) {
      setPasswordMatchError(passwordError);
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Please log in first");

      const changedFields = {};

      // Compare with initialData to find changes
      ["name", "email", "phoneNumber"].forEach((field) => {
        if (formData[field] !== initialData[field]) {
          changedFields[field] = formData[field];
        }
      });

      // Add password change if provided
      if (formData.newPassword) {
        if (!formData.oldPassword) {
          setError("Please enter your current password to change it.");
          setLoading(false);
          return;
        }
        changedFields.oldPassword = formData.oldPassword;
        changedFields.newPassword = formData.newPassword;
      }

      if (Object.keys(changedFields).length === 0) {
        setError("No changes to update.");
        setLoading(false);
        return;
      }

      const res = await axios.put(
        "http://localhost:5000/api/users/update",
        changedFields,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage(res.data.message || "Profile updated successfully!");
      setInitialData({
        name: formData.name,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
      });
      setFormData((prev) => ({
        ...prev,
        oldPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      }));
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Update Profile</h2>
      <form className={styles.profileCard} onSubmit={handleSubmit}>
        {error && <p className={styles.errorText}>{error}</p>}
        {message && <p className={styles.successText}>{message}</p>}

        {/* Name */}
        <label className={styles.label} htmlFor="name">
          Full Name
        </label>
        <input
          className={styles.input}
          id="name"
          name="name"
          type="text"
          placeholder="Enter your full name"
          value={formData.name}
          onChange={handleChange}
          required
        />

        {/* Email */}
        <label className={styles.label} htmlFor="email">
          Email Address
        </label>
        <input
          className={styles.input}
          id="email"
          name="email"
          type="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={handleChange}
          readOnly
        />

        {/* Phone Number */}
        <label className={styles.label} htmlFor="phoneNumber">
          Phone Number
        </label>
        <input
          className={styles.input}
          id="phoneNumber"
          name="phoneNumber"
          type="tel"
          placeholder="03001234567"
          value={formData.phoneNumber}
          onChange={handleChange}
          required
        />
        {phoneNumberError && (
          <p className={styles.errorText}>{phoneNumberError}</p>
        )}

        {/* Old Password */}
        <label className={styles.label} htmlFor="oldPassword">
          Current Password (if changing password)
        </label>
        <input
          className={styles.input}
          id="oldPassword"
          name="oldPassword"
          type="password"
          placeholder="Enter current password"
          value={formData.oldPassword}
          onChange={handleChange}
        />

        {/* New Password */}
        <label className={styles.label} htmlFor="newPassword">
          New Password
        </label>
        <input
          className={styles.input}
          id="newPassword"
          name="newPassword"
          type="password"
          placeholder="Enter new password"
          value={formData.newPassword}
          onChange={handleChange}
        />

        <label className={styles.label} htmlFor="confirmNewPassword">
          Confirm New Password
        </label>
        <input
          className={`${styles.input} ${
            passwordMatchError ? styles.inputError : ""
          }`}
          id="confirmNewPassword"
          name="confirmNewPassword"
          type="password"
          placeholder="Confirm new password"
          value={formData.confirmNewPassword}
          onChange={handleChange}
        />
        {passwordMatchError && (
          <p className={styles.errorText}>{passwordMatchError}</p>
        )}

        {/* Submit Button */}
        <button
          className={`${styles.filterButton} ${styles.active}`}
          type="submit"
          disabled={loading}
        >
          {loading ? "Updating..." : "Update Profile"}
        </button>
      </form>
    </div>
  );
}
