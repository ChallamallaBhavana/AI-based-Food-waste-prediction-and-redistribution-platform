import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Clock, Truck, PackageCheck, Send } from 'lucide-react';

export function StatusBadge({ status, type = 'general' }) {
  if (!status) return null;

  const normalized = status.toUpperCase();

  // Safety Badges
  if (normalized.includes('SAFE FOR REDISTRIBUTION')) {
    return (
      <span className="badge badge-success">
        <CheckCircle2 size={13} /> SAFE FOR REDISTRIBUTION
      </span>
    );
  }
  if (normalized.includes('NOT SAFE')) {
    return (
      <span className="badge badge-danger">
        <XCircle size={13} /> NOT SAFE
      </span>
    );
  }
  if (normalized.includes('NEEDS REVIEW')) {
    return (
      <span className="badge badge-warning">
        <AlertTriangle size={13} /> NEEDS REVIEW
      </span>
    );
  }

  // Delivery & Donation Badges
  if (normalized === 'DELIVERED') {
    return (
      <span className="badge badge-success">
        <PackageCheck size={13} /> Delivered
      </span>
    );
  }
  if (normalized === 'IN TRANSIT') {
    return (
      <span className="badge badge-info">
        <Truck size={13} /> In Transit
      </span>
    );
  }
  if (normalized === 'PICKED UP') {
    return (
      <span className="badge badge-info">
        <Send size={13} /> Picked Up
      </span>
    );
  }
  if (normalized === 'ACCEPTED') {
    return (
      <span className="badge badge-warning">
        <Clock size={13} /> Accepted
      </span>
    );
  }
  if (normalized === 'PENDING') {
    return (
      <span className="badge badge-warning">
        <Clock size={13} /> Pending
      </span>
    );
  }

  // Default
  return <span className="badge badge-info">{status}</span>;
}
