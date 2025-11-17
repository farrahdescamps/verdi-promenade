import React from 'react';

// Navigation Icons - Updated for white color support
export const ParlerIcon = ({ isActive, className = "w-[27px] h-[27px]", color }: { isActive?: boolean; className?: string; color?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 27 27" fill="none">
    <path d="M8.59953 23.5262L2.8125 24.8125L4.09875 19.0255C3.25168 17.441 2.8098 15.6716 2.8125 13.875C2.8125 7.83422 7.70922 2.9375 13.75 2.9375C19.7908 2.9375 24.6875 7.83422 24.6875 13.875C24.6875 19.9158 19.7908 24.8125 13.75 24.8125C11.9534 24.8152 10.184 24.3733 8.59953 23.5262ZM8.91672 21.2152L9.63094 21.598C10.8981 22.2752 12.3132 22.628 13.75 22.625C15.4806 22.625 17.1723 22.1118 18.6112 21.1504C20.0502 20.1889 21.1717 18.8223 21.8339 17.2235C22.4962 15.6246 22.6695 13.8653 22.3319 12.168C21.9943 10.4706 21.1609 8.91153 19.9372 7.68782C18.7135 6.46411 17.1544 5.63075 15.457 5.29313C13.7597 4.95551 12.0004 5.12879 10.4015 5.79105C8.80267 6.45332 7.4361 7.57483 6.47464 9.01376C5.51318 10.4527 5 12.1444 5 13.875C5 15.3341 5.35547 16.7384 6.02813 17.9941L6.40984 18.7083L5.69344 21.9316L8.91672 21.2152ZM8.28125 13.875H10.4688C10.4688 14.7452 10.8145 15.5798 11.4298 16.1952C12.0452 16.8105 12.8798 17.1562 13.75 17.1562C14.6202 17.1562 15.4548 16.8105 16.0702 16.1952C16.6855 15.5798 17.0313 14.7452 17.0313 13.875H19.2188C19.2188 15.3254 18.6426 16.7164 17.617 17.742C16.5914 18.7676 15.2004 19.3438 13.75 19.3438C12.2996 19.3438 10.9086 18.7676 9.88301 17.742C8.85742 16.7164 8.28125 15.3254 8.28125 13.875Z" fill={color || (isActive ? "#0099CC" : "#B7B7B7")} />
  </svg>
);

export const PlanifierIcon = ({ isActive, className = "w-[27px] h-[27px]" }: { isActive?: boolean; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 27 27" fill="none">
    <path d="M13.25 24.8125C7.20922 24.8125 2.3125 19.9158 2.3125 13.875C2.3125 7.83422 7.20922 2.9375 13.25 2.9375C19.2908 2.9375 24.1875 7.83422 24.1875 13.875C24.1875 19.9158 19.2908 24.8125 13.25 24.8125ZM13.25 22.625C15.5706 22.625 17.7962 21.7031 19.4372 20.0622C21.0781 18.4212 22 16.1956 22 13.875C22 11.5544 21.0781 9.32876 19.4372 7.68782C17.7962 6.04687 15.5706 5.125 13.25 5.125C10.9294 5.125 8.70376 6.04687 7.06282 7.68782C5.42187 9.32876 4.5 11.5544 4.5 13.875C4.5 16.1956 5.42187 18.4212 7.06282 20.0622C8.70376 21.7031 10.9294 22.625 13.25 22.625ZM18.1719 8.95312L15.4375 16.0625L8.32812 18.7969L11.0625 11.6875L18.1719 8.95312ZM13.25 14.9688C13.5401 14.9688 13.8183 14.8535 14.0234 14.6484C14.2285 14.4433 14.3438 14.1651 14.3438 13.875C14.3438 13.5849 14.2285 13.3067 14.0234 13.1016C13.8183 12.8965 13.5401 12.7812 13.25 12.7812C12.9599 12.7812 12.6817 12.8965 12.4766 13.1016C12.2715 13.3067 12.1562 13.5849 12.1562 13.875C12.1562 14.1651 12.2715 14.4433 12.4766 14.6484C12.6817 14.8535 12.9599 14.9688 13.25 14.9688Z" fill={isActive ? "#0099CC" : "#B7B7B7"} />
  </svg>
);

export const ExplorerIcon = ({ isActive, className = "w-[27px] h-[27px]" }: { isActive?: boolean; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 27 27" fill="none">
    <path d="M14.8438 23.7187H20.3125V25.9062H7.1875V23.7187H12.6563V22.5703C10.9221 22.3961 9.25462 21.8102 7.79274 20.8612C6.33086 19.9123 5.11686 18.6277 4.25188 17.1146L6.15172 16.0296C6.81977 17.1969 7.74791 18.1945 8.86406 18.9449C9.98021 19.6953 11.2543 20.1783 12.5874 20.3564C13.9205 20.5345 15.2768 20.4029 16.5507 19.9718C17.8247 19.5407 18.9822 18.8217 19.9332 17.8706C20.8842 16.9196 21.6032 15.7622 22.0343 14.4882C22.4654 13.2142 22.597 11.858 22.419 10.5249C22.2409 9.19178 21.7579 7.91766 21.0075 6.80151C20.2571 5.68536 19.2595 4.75722 18.0922 4.08917L19.1772 2.18933C20.8518 3.14587 22.2435 4.52832 23.2113 6.19643C24.179 7.86454 24.6883 9.75895 24.6875 11.6875C24.6875 17.3586 20.3705 22.0223 14.8438 22.5703V23.7187ZM13.75 19.3437C12.7446 19.3437 11.749 19.1457 10.8201 18.7609C9.89118 18.3761 9.04716 17.8122 8.33622 17.1012C7.62527 16.3903 7.06131 15.5463 6.67655 14.6174C6.29179 13.6885 6.09375 12.6929 6.09375 11.6875C6.09375 10.682 6.29179 9.68644 6.67655 8.75754C7.06131 7.82864 7.62527 6.98462 8.33622 6.27367C9.04716 5.56272 9.89118 4.99877 10.8201 4.614C11.749 4.22924 12.7446 4.03121 13.75 4.03121C15.7806 4.03121 17.728 4.83784 19.1638 6.27367C20.5996 7.7095 21.4063 9.65689 21.4063 11.6875C21.4063 13.718 20.5996 15.6654 19.1638 17.1012C17.728 18.5371 15.7806 19.3437 13.75 19.3437ZM13.75 17.1562C15.2004 17.1562 16.5914 16.58 17.617 15.5544C18.6426 14.5289 19.2188 13.1379 19.2188 11.6875C19.2188 10.2371 18.6426 8.84606 17.617 7.82047C16.5914 6.79488 15.2004 6.21871 13.75 6.21871C12.2996 6.21871 10.9086 6.79488 9.88301 7.82047C8.85742 8.84606 8.28125 10.2371 8.28125 11.6875C8.28125 13.1379 8.85742 14.5289 9.88301 15.5544C10.9086 16.58 12.2996 17.1562 13.75 17.1562Z" fill={isActive ? "#0099CC" : "#B7B7B7"} />
  </svg>
);

export const ProfilIcon = ({ isActive, className = "w-[27px] h-[27px]" }: { isActive?: boolean; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 27 27" fill="none">
    <path d="M19.6386 17.877L19.8311 18.0706L20.0258 17.877C20.2543 17.6485 20.5256 17.4672 20.8242 17.3436C21.1227 17.2199 21.4428 17.1562 21.7659 17.1562C22.0891 17.1562 22.4091 17.2199 22.7077 17.3436C23.0063 17.4672 23.2776 17.6485 23.5061 17.877C23.7346 18.1056 23.9159 18.3768 24.0396 18.6754C24.1632 18.974 24.2269 19.294 24.2269 19.6172C24.2269 19.9404 24.1632 20.2604 24.0396 20.559C23.9159 20.8575 23.7346 21.1288 23.5061 21.3573L19.8311 25.0312L16.1583 21.3573C15.6968 20.8958 15.4375 20.2699 15.4375 19.6172C15.4375 18.9645 15.6968 18.3386 16.1583 17.877C16.6198 17.4155 17.2458 17.1562 17.8984 17.1562C18.5511 17.1562 19.1771 17.4155 19.6386 17.877ZM13.25 16.0625V18.25C11.5095 18.25 9.84032 18.9414 8.60961 20.1721C7.3789 21.4028 6.6875 23.072 6.6875 24.8125H4.5C4.50003 22.5392 5.38478 20.3552 6.96692 18.7228C8.54907 17.0905 10.7044 16.1379 12.9766 16.0669L13.25 16.0625ZM13.25 1.84375C16.8758 1.84375 19.8125 4.78047 19.8125 8.40625C19.8131 10.1043 19.1553 11.7365 17.9773 12.9595C16.7993 14.1826 15.193 14.9012 13.4961 14.9644L13.25 14.9688C9.62422 14.9688 6.6875 12.032 6.6875 8.40625C6.68689 6.70817 7.34474 5.07601 8.52271 3.85296C9.70068 2.62991 11.307 1.91126 13.0039 1.84812L13.25 1.84375ZM13.25 4.03125C10.8328 4.03125 8.875 5.98906 8.875 8.40625C8.875 10.8234 10.8328 12.7812 13.25 12.7812C15.6672 12.7812 17.625 10.8234 17.625 8.40625C17.625 5.98906 15.6672 4.03125 13.25 4.03125Z" fill={isActive ? "#0099CC" : "#B7B7B7"} />
  </svg>
);

// Activity Icons
export const ClockIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12,6 12,12 16,14"/>
  </svg>
);

export const CameraIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m9 9 3 3 3-3"/>
    <path d="M20 4h-3.4a2 2 0 0 1-1.6-.8l-1.2-1.6a2 2 0 0 0-1.6-.8H8.8a2 2 0 0 0-1.6.8L6 3.2a2 2 0 0 1-1.6.8H1"/>
    <rect width="20" height="14" x="2" y="4" rx="2"/>
  </svg>
);

export const FootprintsIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 16v-2.38C4 11.5 2.97 10.5 3 8c.03-2.72 1.49-6 4.5-6C9.37 2 10 3.8 10 5.5c0 3.11-2 5.66-2 8.68V16a2 2 0 1 1-4 0Z"/>
    <path d="M20 20v-2.38c0-2.12 1.03-3.12 1-5.62-.03-2.72-1.49-6-4.5-6C14.63 6 14 7.8 14 9.5c0 3.11 2 5.66 2 8.68V20a2 2 0 1 0 4 0Z"/>
    <path d="M16 17h4"/>
    <path d="M4 13h4"/>
  </svg>
);

export const HeadphonesIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3"/>
  </svg>
);

export const BookOpenIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
  </svg>
);

export const CompassIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88"/>
  </svg>
);

export const PlayIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="5,3 19,12 5,21"/>
  </svg>
);

export const SeedlingIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2v20"/>
    <path d="M2 9s3-7 10-7 10 7 10 7"/>
    <path d="M2 15s3-7 10-7 10 7 10 7"/>
  </svg>
);

export const UtensilsIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/>
    <path d="M7 2v20"/>
    <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>
  </svg>
);

export const PaletteIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/>
    <circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/>
    <circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/>
    <circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/>
    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>
  </svg>
);

export const SafariIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88"/>
  </svg>
);

export const MessageCircleIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>
  </svg>
);

export const ChevronLeftIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m15 18-6-6 6-6"/>
  </svg>
);

export const ChevronRightIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m9 18 6-6-6-6"/>
  </svg>
);

// Card Stack Icons
export const HeartIcon = ({ className = "w-10 h-10" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 41 42" fill="none" className={className}>
    <path d="M26.7823 5.91641C24.5779 5.88452 22.2793 6.52349 20.4979 8.31754C18.7027 6.52699 16.3822 5.91628 14.2375 5.91628C8.90831 5.91628 3.57312 10.3316 3.57312 16.5803C3.57312 22.6052 7.42664 27.621 11.238 31.031C13.1665 32.7564 15.1444 34.1262 16.7507 35.0695C17.5533 35.5409 18.2768 35.9138 18.8671 36.1735C19.1612 36.3029 19.4372 36.4109 19.683 36.4888C19.8969 36.5567 20.1984 36.6388 20.5007 36.6388C20.803 36.6388 21.1045 36.5567 21.3184 36.4888C21.5642 36.4109 21.8402 36.3029 22.1343 36.1735C22.7246 35.9138 23.4481 35.5409 24.2507 35.0695C25.857 34.1262 27.8349 32.7564 29.7634 31.031C33.5748 27.621 37.4283 22.6051 37.4283 16.5803C37.4283 10.3168 32.0807 5.99308 26.7823 5.91641Z" fill="white"/>
  </svg>
);

export const XIcon = ({ className = "w-10 h-10" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 41 42" fill="none" className={className}>
    <path fillRule="evenodd" clipRule="evenodd" d="M11.1795 9.73422C10.6011 9.15581 9.66329 9.15581 9.08487 9.73422C8.50646 10.3126 8.50646 11.2504 9.08487 11.8288L18.4054 21.1494L9.08487 30.4699C8.50646 31.0483 8.50646 31.9861 9.08487 32.5645C9.66329 33.1429 10.6011 33.1429 11.1795 32.5645L20.5 23.244L29.8205 32.5645C30.399 33.1429 31.3368 33.1429 31.9152 32.5645C32.4936 31.9861 32.4936 31.0483 31.9152 30.4699L22.5946 21.1494L31.9152 11.8288C32.4936 11.2504 32.4936 10.3126 31.9152 9.73422C31.3368 9.15581 30.399 9.15581 29.8205 9.73422L20.5 19.0548L11.1795 9.73422Z" fill="white"/>
  </svg>
);

// Search and Input Icons
export const SearchIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/>
    <path d="m21 21-4.35-4.35"/>
  </svg>
);

export const MicIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
    <line x1="12" x2="12" y1="19" y2="22"/>
  </svg>
);

export const EyeIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

export const EyeOffIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
    <line x1="2" x2="22" y1="2" y2="22"/>
  </svg>
);

export const ChevronDownIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m6 9 6 6 6-6"/>
  </svg>
);

export const ChevronUpIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m18 15-6-6-6 6"/>
  </svg>
);

export const CheckIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6 9 17l-5-5"/>
  </svg>
);

// Brand Logo Icon
export { BrandLogoIcon } from './BrandLogoIcon';