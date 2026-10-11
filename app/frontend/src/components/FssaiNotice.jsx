import { BUSINESS } from '../lib/api';

export default function FssaiNotice({ className = '' }) {
  return <p className={`text-sm text-muted-foreground ${className}`}>
    FSSAI No. <span className="whitespace-nowrap font-medium tabular-nums text-foreground">{BUSINESS.fssaiNumber}</span>
  </p>;
}
