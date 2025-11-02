import React from "react";
import { ClassicBaguaDiagram } from "@/components/ui/ClassicBagua";

const BaguaPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-cosmic-gradient relative overflow-hidden flex items-center justify-center">
      {/* 经典八卦图 */}
      <div className="flex items-center justify-center">
        <ClassicBaguaDiagram size="lg" animate={true} className="scale-100" />
      </div>
    </div>
  );
};

export default BaguaPage;
