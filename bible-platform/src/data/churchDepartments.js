// 화도벧엘교회 공식 8대 기관/부서 데이터
export const CHURCH_DEPARTMENTS = [
  { id: 'dept_caleb', name: '갈렙 (남전도회)', shortName: '갈렙', category: '남전도회', icon: '🛡️', color: '#3b82f6' },
  { id: 'dept_joshua', name: '여호수아 (남전도회)', shortName: '여호수아', category: '남전도회', icon: '⚔️', color: '#60a5fa' },
  { id: 'dept_joanna', name: '요안나 (여전도회)', shortName: '요안나', category: '여전도회', icon: '🌸', color: '#f472b6' },
  { id: 'dept_lydia', name: '루디아 (여전도회)', shortName: '루디아', category: '여전도회', icon: '💜', color: '#c084fc' },
  { id: 'dept_naomi', name: '나오미 (여전도회)', shortName: '나오미', category: '여전도회', icon: '🌿', color: '#34d399' },
  { id: 'dept_joseph', name: '요셉 (청년부)', shortName: '요셉', category: '청년부', icon: '✨', color: '#fbbf24' },
  { id: 'dept_ezekiel', name: '에스겔 (학생부)', shortName: '에스겔', category: '학생부', icon: '🔥', color: '#f87171' },
  { id: 'dept_sunday_school', name: '주일학교', shortName: '주일학교', category: '어린이', icon: '🌱', color: '#a3e635' },
];

export const CHURCH_DEPARTMENT_NAMES = CHURCH_DEPARTMENTS.map(d => d.name);
