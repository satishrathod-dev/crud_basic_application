import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import "./CustomerForm.css";

const CustomerForm = () => {
  // get userid from url
  const { id } = useParams();
  const navigate = useNavigate();

  //state variables
  const [pan, setPan] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("+91");
  const [addresses, setAddresses] = useState([
    { addressLine1: "", addressLine2: "", postcode: "", city: "", state: "" },
  ]);
  const [loading, setLoading] = useState({ pan: false, postcode: false });
  const [editMode, setEditMode] = useState(false);

  // Load customer data if temp is in edit mode
  useEffect(() => {
    if (id) {
      const customers = JSON.parse(localStorage.getItem("customers")) || [];
      const customer = customers[id];
      if (customer) {
        setPan(customer.pan);
        setFullName(customer.fullName);
        setEmail(customer.email);
        setMobile(customer.mobile);
        setAddresses(customer.addresses);
        setEditMode(true);
      }
    }
  }, [id]);

  // Handle PAN input and api call
  const handlePANChange = async (e) => {
    const value = e.target.value;
    setPan(value);

    // Validate PAN length before making the request
    if (value.length !== 10) {
      setFullName("");
    } else {
      setLoading((prev) => ({ ...prev, pan: true }));
      try {
        const response = await axios.post(
          "https://lab.pixel6.co/api/verify-pan.php",
          { panNumber: value }
        );
        console.log(response.data);

        //Testing with hardcode data:
        // const response = {
        //   data: {
        //     isValid: value === "1234567890",
        //     fullName: "Satish",
        //   },
        // };

        if (response.data.isValid) {
          setFullName(response.data.fullName);
        } else {
          setFullName("");
        }
      } catch (error) {
        console.error("Error verifying PAN:", error);
      } finally {
        setLoading((prev) => ({ ...prev, pan: false }));
      }
    }
  };

  // Handle Postcode input and api call
  const handlePostcodeChange = async (index, e) => {
    const value = e.target.value;
    const updatedAddresses = [...addresses];
    updatedAddresses[index].postcode = value;
    setAddresses(updatedAddresses);

    if (value.length !== 6) {
      setLoading((prev) => ({ ...prev, postcode: false }));
    } else {
      setLoading((prev) => ({ ...prev, postcode: true }));
      try {
        const response = await axios.post(
          "https://lab.pixel6.co/api/get-postcode-details.php",
          { postcode: value }
        );
        updatedAddresses[index].city = response.data.city[0]?.name || "";
        updatedAddresses[index].state = response.data.state[0]?.name || "";
        setAddresses(updatedAddresses);
      } catch (error) {
        console.error("Error fetching postcode details:", error);
      } finally {
        setLoading((prev) => ({ ...prev, postcode: false }));
      }
    }
  };

  // Handle address input
  const handleAddressChange = (index, field, value) => {
    const updatedAddresses = [...addresses];
    updatedAddresses[index][field] = value;
    setAddresses(updatedAddresses);
  };

  const handleAddAddress = () => {
    if (addresses.length < 10) {
      setAddresses([
        ...addresses,
        {
          addressLine1: "",
          addressLine2: "",
          postcode: "",
          city: "",
          state: "",
        },
      ]);
    }
  };

  // Remove address onclick
  const handleRemoveAddress = (index) => {
    if (addresses.length > 1) {
      const updatedAddresses = addresses.filter((_, i) => i !== index);
      setAddresses(updatedAddresses);
    } else {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "You need to add atleast one address!",
        // footer: '<a href="#">Why do I have this issue?</a>',
      });
    }
  };

  // Validate form at the time of submitting
  const validateForm = () => {
    let valid = true;
    let message = "";

    if (pan.length !== 10) {
      message += "Invalid PAN format.\n";
      valid = false;
    }
    if (fullName.trim() === "" || fullName.length > 140) {
      message +=
        "Full Name is mandatory and should be less than 140 characters.\n";
      valid = false;
    }
    if (email.length > 255) {
      message += "Invalid Email format or too long.\n";
      valid = false;
    }
    if (!/^\+91[0-9]{10}$/.test(mobile)) {
      message +=
        "Mobile number field should be in valid form Eg: +91XXXXXXXXXX.\n";
      valid = false;
    }
    if (
      addresses.some(
        (address) =>
          !address.addressLine1.trim() ||
          !address.postcode.trim() ||
          !address.city.trim() ||
          !address.state.trim()
      )
    ) {
      message += "Address fields are mandatory.\n";
      valid = false;
    }

    if (!valid) {
      Swal.fire({
        icon: "error",
        title: "Invalid Input",
        text: message.trim(),
      });
    }

    return valid;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      const newCustomer = { pan, fullName, email, mobile, addresses };
      let customers = JSON.parse(localStorage.getItem("customers")) || [];
      if (editMode) {
        customers[id] = newCustomer;
      } else {
        customers.push(newCustomer);
      }
      localStorage.setItem("customers", JSON.stringify(customers));
      navigate("/");
    }
  };

  // jsx
  return (
    <div className="customer-form">
      <h2>{editMode ? "Edit Customer" : "Add Customer"}</h2>
      <div className="form-group">
        <label>PAN (10 digits):</label>
        <input
          type="text"
          value={pan}
          onChange={handlePANChange}
          placeholder="PAN (10 digits)"
          maxLength="10"
        />
        {loading.pan && <span className="loading">Loading...</span>}
      </div>
      <div className="form-group">
        <label>Full Name:</label>
        <input type="text" value={fullName} readOnly placeholder="Full Name" />
      </div>
      <div className="form-group">
        <label>Email:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
        />
      </div>
      <div className="form-group">
        <label>Mobile Number:</label>
        <input
          type="text"
          // value={`+91${mobile}`}
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
          placeholder="Mobile Number"
        />
      </div>

      {addresses.map((address, index) => (
        <div key={index} className="address-group">
          <h3>Address {index + 1}</h3>
          <div className="form-group">
            <label>Address Line 1:</label>
            <input
              type="text"
              value={address.addressLine1}
              onChange={(e) =>
                handleAddressChange(index, "addressLine1", e.target.value)
              }
              placeholder="Address Line 1"
            />
          </div>
          <div className="form-group">
            <label>Address Line 2:</label>
            <input
              type="text"
              value={address.addressLine2}
              onChange={(e) =>
                handleAddressChange(index, "addressLine2", e.target.value)
              }
              placeholder="Address Line 2"
            />
          </div>
          <div className="form-group">
            <label>Postcode:</label>
            <input
              type="text"
              value={address.postcode}
              onChange={(e) => handlePostcodeChange(index, e)}
              placeholder="Enter 6 digit Postcode"
              maxLength="6"
            />
            {loading.postcode && <span className="loading">Loading...</span>}
          </div>
          <div className="form-group">
            <label>City:</label>
            <input
              type="text"
              value={address.city}
              readOnly
              placeholder="City"
            />
          </div>
          <div className="form-group">
            <label>State:</label>
            <input
              type="text"
              value={address.state}
              readOnly
              placeholder="State"
            />
            <button
              type="button"
              onClick={() => handleRemoveAddress(index)}
              className="remove-address-button"
            >
              {" "}
              Remove Address{" "}
            </button>
          </div>
        </div>
      ))}

      {addresses.length < 10 && (
        <button onClick={handleAddAddress} className="add-address-button">
          + Add Address
        </button>
      )}

      <button onClick={handleSubmit} className="submit-button">
        {editMode ? "Update" : "Save"}
      </button>
    </div>
  );
};
export default CustomerForm;
