import React, { createContext, useContext, useState } from 'react';
import NotificationModal from '../components/NotificationModal';
import PaymentModal from '../components/PaymentModal';

const ModalContext = createContext();

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};

export const ModalProvider = ({ children }) => {
  const [notificationModal, setNotificationModal] = useState({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
    onConfirm: null,
    confirmText: 'OK'
  });

  const [paymentModal, setPaymentModal] = useState({
    isOpen: false,
    amount: 0,
    onConfirm: null
  });

  const showNotification = (type, title, message, onConfirm = null, confirmText = 'OK') => {
    setNotificationModal({
      isOpen: true,
      type,
      title,
      message,
      onConfirm,
      confirmText
    });
  };

  const showSuccess = (title, message, onConfirm = null) => {
    showNotification('success', title, message, onConfirm);
  };

  const showError = (title, message, onConfirm = null) => {
    showNotification('error', title, message, onConfirm);
  };

  const showWarning = (title, message, onConfirm = null) => {
    showNotification('warning', title, message, onConfirm);
  };

  const showInfo = (title, message, onConfirm = null) => {
    showNotification('info', title, message, onConfirm);
  };

  const showPayment = (amount, onConfirm) => {
    setPaymentModal({
      isOpen: true,
      amount,
      onConfirm
    });
  };

  const closeNotification = () => {
    setNotificationModal(prev => ({ ...prev, isOpen: false }));
  };

  const closePayment = () => {
    setPaymentModal(prev => ({ ...prev, isOpen: false }));
  };

  return (
    <ModalContext.Provider
      value={{
        showSuccess,
        showError,
        showWarning,
        showInfo,
        showPayment,
        closeNotification,
        closePayment
      }}
    >
      {children}
      
      <NotificationModal
        isOpen={notificationModal.isOpen}
        onClose={closeNotification}
        type={notificationModal.type}
        title={notificationModal.title}
        message={notificationModal.message}
        onConfirm={notificationModal.onConfirm}
        confirmText={notificationModal.confirmText}
      />
      
      <PaymentModal
        isOpen={paymentModal.isOpen}
        onClose={closePayment}
        amount={paymentModal.amount}
        onConfirm={paymentModal.onConfirm}
      />
    </ModalContext.Provider>
  );
};
