import React from 'react';

const staff = [
  {
    id: 1,
    name: 'David Chen',
    assignment: 'Engine Bay #04',
    status: 'ACTIVE',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
  },
  {
    id: 2,
    name: 'Leila Vance',
    assignment: 'Customer Reception',
    status: 'ACTIVE',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Leila',
  },
  {
    id: 3,
    name: 'Elena Rossi',
    assignment: 'Inventory Audit',
    status: 'IDLE',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elena',
  },
];

export const StaffOverview: React.FC = () => {
  return (
    <div className="bg-white border p-8 rounded-2xl h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <h3 className="font-headline font-bold text-xl text-primary">Staff Overview</h3>
        <div className="bg-[#eefcf4] px-3 py-1 rounded-md">
          <span className="text-[10px] font-bold text-success tracking-widest uppercase">8 Active Now</span>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b text-[10px] font-bold text-muted-foreground tracking-widest uppercase">
              <th className="pb-4">Worker</th>
              <th className="pb-4">Assignment</th>
              <th className="pb-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {staff.map((member) => (
              <tr key={member.id} className="group hover:bg-secondary/30 transition-colors">
                <td className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-secondary">
                      <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                    </div>
                    <span className="font-bold text-sm text-primary">{member.name}</span>
                  </div>
                </td>
                <td className="py-4 font-bold text-[13px] text-muted-foreground">{member.assignment}</td>
                <td className="py-4 text-right">
                  <span className={`inline-block w-2.5 h-2.5 rounded-full ${member.status === 'ACTIVE' ? 'bg-success' : 'bg-warning'}`}></span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
