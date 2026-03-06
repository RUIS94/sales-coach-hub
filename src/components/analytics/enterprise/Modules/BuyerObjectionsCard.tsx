import React from 'react';
import { Shield, Info, Meh } from 'lucide-react';

interface BuyerObjectionsCardProps {
  onDataClick: (title: string, content: string, value: number) => void;
}

const BuyerObjectionsCard: React.FC<BuyerObjectionsCardProps> = ({ onDataClick }) => {
  const objectionItems = [
    { text: 'Timing, Timeframe', score: 6, value: 3, description: 'Concerns about project timeline, implementation schedule, and timing conflicts with other initiatives' },
    { text: 'Economy', score: 1, value: 2, description: 'Economic uncertainties, market conditions, and broader financial climate affecting purchase decisions' },
    { text: 'Money', score: 4, value: 5, description: 'Budget constraints, cost concerns, and financial approval challenges within the organization' },
    { text: 'People', score: 4, value: 3, description: 'Staffing concerns, resource availability, and change management challenges with team adoption' },
    { text: 'Technology', score: 4, value: 4, description: 'Technical compatibility, integration challenges, and concerns about system reliability and performance' }
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-xl transition-all duration-300">
      <div className="flex items-center mb-6 pb-4 border-b border-gray-200">
        <div className="flex items-center">
          <div className="p-3 rounded-lg" style={{ backgroundColor: 'transparent' }}>
            <Shield className="w-6 h-6" style={{ color: '#605BFF' }} />
          </div>
          <div className="ml-4">
            <div className="flex items-center">
              <h3 className="text-xl font-semibold text-gray-900">Buyer's Objections</h3>
              <div className="ml-3 relative group">
                <Info className="w-5 h-5 text-gray-400 hover:text-gray-600 transition-colors duration-200 cursor-help" />
                <div className="absolute left-1/2 transform -translate-x-1/2 top-full mt-2 w-80 p-3 bg-white text-gray-900 text-sm rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-20">
                  <div className="font-medium mb-1">Buyer's Objections - T.E.M.P.T.</div>
                  <div className="text-gray-600">Identifies and addresses common buyer concerns and resistance points using the TEMPT framework: Timing, Economy, Money, People, and Technology objections that may prevent deal closure.</div>
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-white"></div>
                </div>
              </div>
            </div>
            <p className="text-sm text-[#605BFF] font-medium">T.E.M.P.T.</p>
          </div>
        </div>
        <div className="ml-auto flex items-center justify-end">
          <div className="flex items-center justify-center w-12">
            <Meh 
              className="w-6 h-6" 
              style={{ color: 'orange' }}
            />
          </div>
        </div>
      </div>
      
      <div className="space-y-0">
        {objectionItems.map((item, index) => (
          <div key={index} className="py-0.5 px-1 rounded-lg hover:bg-gray-50 transition-colors duration-200 relative group">
            <div className="flex items-center justify-between">
              <span className="text-gray-700 text-sm flex-shrink-0 w-64">{item.text}</span>
              <div className="flex-1 bg-gray-200 rounded-full h-1 mx-3">
                <div 
                  className="h-1 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${(item.score / 10) * 100}%`,
                    backgroundColor: item.score < 4 ? 'red' : item.score >= 4 && item.score < 6 ? '#FF8E1C' : 'green'
                  }}
                ></div>
              </div>
              <button
                onClick={() => onDataClick('Buyer Objections', item.text, item.value)}
                className="px-3 py-1 rounded-full text-sm font-medium hover:opacity-90 transition-opacity duration-200 flex-shrink-0"
                style={{ 
                  color: item.score < 4 ? 'red' : item.score >= 4 && item.score < 6 ? '#FF8E1C' : 'green'
                }}
              >
                {item.value}
              </button>
            </div>
            
            <div className="absolute left-0 bottom-full mb-2 w-80 p-3 bg-white text-gray-900 text-sm rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
              <div className="font-medium mb-1">{item.text}</div>
              <div className="text-gray-600">{item.description}</div>
              <div className="absolute top-full left-6 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BuyerObjectionsCard;
