import type { ReactNode } from "react";

export interface IconProps {
  className?: string;
  fill?: string;
  size?: 'xsmall' | 'small' | 'medium' | 'large' | 'xlarge' | number;
  children?: ReactNode;
  style?: Record<string, unknown>;
}
