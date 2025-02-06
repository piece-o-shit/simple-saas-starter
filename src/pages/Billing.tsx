
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { CreditCard, Check } from "lucide-react";

const Billing = () => {
  return (
    <DashboardLayout>
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6">Billing</h2>
        
        <div className="grid md:grid-cols-3 gap-6">
          {/* Free Tier */}
          <div className="border rounded-lg p-6">
            <h3 className="text-lg font-semibold">Free Tier</h3>
            <p className="text-3xl font-bold mt-2">$0<span className="text-sm font-normal">/month</span></p>
            <ul className="mt-4 space-y-2">
              <li className="flex items-center">
                <Check className="h-4 w-4 text-green-500 mr-2" />
                <span>Basic features</span>
              </li>
              <li className="flex items-center">
                <Check className="h-4 w-4 text-green-500 mr-2" />
                <span>1 user</span>
              </li>
            </ul>
            <Button className="w-full mt-6" variant="outline">
              Current Plan
            </Button>
          </div>

          {/* Pro Tier */}
          <div className="border rounded-lg p-6 bg-primary text-primary-foreground">
            <h3 className="text-lg font-semibold">Pro</h3>
            <p className="text-3xl font-bold mt-2">$19<span className="text-sm font-normal">/month</span></p>
            <ul className="mt-4 space-y-2">
              <li className="flex items-center">
                <Check className="h-4 w-4 mr-2" />
                <span>All Free features</span>
              </li>
              <li className="flex items-center">
                <Check className="h-4 w-4 mr-2" />
                <span>Unlimited users</span>
              </li>
              <li className="flex items-center">
                <Check className="h-4 w-4 mr-2" />
                <span>Advanced features</span>
              </li>
            </ul>
            <Button className="w-full mt-6" variant="secondary">
              Upgrade to Pro
            </Button>
          </div>

          {/* Enterprise Tier */}
          <div className="border rounded-lg p-6">
            <h3 className="text-lg font-semibold">Enterprise</h3>
            <p className="text-3xl font-bold mt-2">$99<span className="text-sm font-normal">/month</span></p>
            <ul className="mt-4 space-y-2">
              <li className="flex items-center">
                <Check className="h-4 w-4 text-green-500 mr-2" />
                <span>All Pro features</span>
              </li>
              <li className="flex items-center">
                <Check className="h-4 w-4 text-green-500 mr-2" />
                <span>24/7 support</span>
              </li>
              <li className="flex items-center">
                <Check className="h-4 w-4 text-green-500 mr-2" />
                <span>Custom features</span>
              </li>
            </ul>
            <Button className="w-full mt-6">
              Contact Sales
            </Button>
          </div>
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
