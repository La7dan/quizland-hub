
import React from 'react';

interface JumpingHorseProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

const JumpingHorse: React.FC<JumpingHorseProps> = ({
  size = 24,
  color = "currentColor",
  strokeWidth = 2,
  ...props
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {/* Stylized jumping horse */}
      <path d="M19,10c-0.9-1.25-2.25-2-4.5-2c-1.23,0-2.5,0.25-3.5,1.25C8.5,7.5,6,8,4,10.5" />
      <path d="M4,17.5c0.5-2.25,1.21-4,3.5-5c1.25,1.25,2,1.25,3,0c0.5,1.5,1.75,2.5,3.5,2.5c1.25,0,3-0.5,3.5-1c1.25,0.5,1.5,1.25,1.5,2.5" />
      <path d="M13.5,13.5c0,0,2-1.75,3-1.5c1,0.25,1.25,1.25,0.75,2s-1.75,1.25-3,1.25" />
      <path d="M4,10.5c-1,0.25-1.25,1.5-0.75,2.25s2,0.75,2.75,0" />
      <path d="M10.5,9.75c0,0-1.5,0.75-1.5,1.5s0.5,1.25,1.5,1.25s1.5-0.5,1.5-1.25S10.5,9.75,10.5,9.75z" />
    </svg>
  );
};

export default JumpingHorse;
