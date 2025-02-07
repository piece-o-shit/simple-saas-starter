
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { CreditCard, Check, X } from "lucide-react";
import { useFeatures } from "@/hooks/use-features";
import { features } from "@/config/features";

const Billing = () => {
  const { subscription } = useFeatures();

  const tiers = {
    free: {
      name: "Free Tier",
      price: "$0",
      features: Object.values(features).filter(f => f.tier === 'free'),
    },
    pro: {
      name: "Pro",
      price: "$19",
      features: Object.values(features).filter(f => f.tier === 'pro'),
    },
    enterprise: {
      name: "Enterprise",
      price: "$99",
      features: Object.values(features).filter(f => f.tier === 'enterprise'),
    },
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6">Billing</h2>
        
        <div className="grid md:grid-cols-3 gap-6">
          {Object.entries(tiers).map(([tier, details]) => (
            <div key={tier} className={`border rounded-lg p-6 ${tier === 'pro' ? 'bg-primary text-primary-foreground' : ''}`}>
              <h3 className="text-lg font-semibold">{details.name}</h3>
              <p className="text-3xl font-bold mt-2">{details.price}<span className="text-sm font-normal">/month</span></p>
              <ul className="mt-4 space-y-2">
                {details.features.map((feature) => (
                  <li key={feature.name} className="flex items-center">
                    {tier === 'pro' ? (
                      <Check className="h-4 w-4 mr-2" />
                    ) : (
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                    )}
                    <span>{feature.name}</span>
                  </li>
                ))}
              </ul>
              <Button 
                className="w-full mt-6" 
                variant={tier === 'pro' ? 'secondary' : tier === subscription ? 'outline' : 'default'}
              >
                {tier === subscription ? 'Current Plan' : tier === 'enterprise' ? 'Contact Sales' : `Upgrade to ${details.name}`}
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-12">
          <h3 className="text-lg font-semibold mb-4">Payment Method</h3>
          <Button variant="outline">
            <CreditCard className="mr-2 h-4 w-4" />
            Add Payment Method
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Billing;
