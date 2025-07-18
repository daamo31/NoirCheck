/**
 * XION Abstraxion Modal Component
 * Renders the authentication modal for XION wallet connection
 */

"use client";

import React, { useEffect } from 'react';
import { Abstraxion, useModal, useAbstraxionAccount } from '@burnt-labs/abstraxion';

export default function XIONModal() {
  const [showModal, setShowModal] = useModal();
  const abstraxionAccount = useAbstraxionAccount();

  // Auto-close modal when user successfully connects
  useEffect(() => {
    if (abstraxionAccount?.isConnected && showModal) {
      // Wait a bit to show success, then close
      setTimeout(() => {
        setShowModal(false);
      }, 2000);
    }
  }, [abstraxionAccount?.isConnected, showModal, setShowModal]);

  const handleClose = () => {
    setShowModal(false);
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal Container */}
      <div className="relative z-50 w-full max-w-md mx-4">
        {/* Accessible title for screen readers */}
        <div className="sr-only">
          <h2 id="xion-modal-title">XION Wallet Authentication</h2>
          <p id="xion-modal-description">
            Connect your XION wallet to authenticate with NoirCheck
          </p>
        </div>
        
        {/* XION Abstraxion Modal */}
        <Abstraxion onClose={handleClose} />
      </div>
    </div>
  );
}
