export type Employee = {
  id: string;
  name: string;
  department: string;
  role: string;
  email: string;
};

const mockEmployees: Employee[] = [
  { id: "EMP-001", name: "Alice Smith", department: "ENGINEERING", role: "Frontend Engineer", email: "alice@glassbox.local" },
  { id: "EMP-002", name: "Bob Jones", department: "ENGINEERING", role: "Backend Engineer", email: "bob@glassbox.local" },
  { id: "EMP-003", name: "Charlie Brown", department: "MARKETING", role: "Marketing Manager", email: "charlie@glassbox.local" },
  { id: "EMP-004", name: "Diana Prince", department: "HUMAN_RES", role: "HR Specialist", email: "diana@glassbox.local" },
  { id: "EMP-005", name: "Evan Wright", department: "EXECUTIVE", role: "CEO", email: "evan@glassbox.local" },
];

export const fetchEmployees = async (): Promise<Employee[]> => {
  // Simulate API delay
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockEmployees);
    }, 500);
  });
};
