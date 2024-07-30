import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./CustomerList.css";

const CustomerList = () => {
  // state variables
  const [customers, setCustomers] = useState([]);

  // Load customers from localStorage on component render
  useEffect(() => {
    const storedCustomers = JSON.parse(localStorage.getItem("customers")) || [];
    setCustomers(storedCustomers);
  }, []);

  // Deleting a customer
  const handleDelete = (index) => {
    const updatedCustomers = customers.filter((_, i) => i !== index);
    localStorage.setItem("customers", JSON.stringify(updatedCustomers));
    setCustomers(updatedCustomers);
  };

  return (
    <div className="customer-list">
      <h2>Customer List</h2>
      <Link to="/add" className="add-button">
        Add New Customer
      </Link>
      <table>
        <thead>
          <tr>
            <th>PAN</th>
            <th>Full Name</th>
            <th>Email</th>
            <th>Mobile</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {customers.length > 0 ? (
            customers.map((customer, index) => (
              <tr key={index}>
                <td>{customer.pan}</td>
                <td>{customer.fullName}</td>
                <td>{customer.email}</td>
                <td>{customer.mobile}</td>
                <td>
                  <button
                    className="delete-button"
                    onClick={() => handleDelete(index)}
                  >
                    Delete
                  </button>
                  <Link to={`/edit/${index}`}>
                    <button className="edit-button">Edit</button>
                  </Link>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="no-customers">
                No customers found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CustomerList;
