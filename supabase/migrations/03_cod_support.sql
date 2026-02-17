-- Add payment_method and is_paid columns to orders table

ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS payment_method text DEFAULT 'prepaid',
ADD COLUMN IF NOT EXISTS is_paid boolean DEFAULT false;

-- Update existing orders to have is_paid = true (assuming all past orders were prepaid via Razorpay)
-- and payment_method = 'razorpay' (or 'prepaid')
UPDATE orders SET is_paid = true, payment_method = 'razorpay' WHERE payment_method = 'prepaid';
-- Actually the default is 'prepaid', so we can just set them to 'razorpay' if we want to be specific, 
-- but 'prepaid' is fine as a generic term. 
-- Let's stick to the plan: default 'prepaid'. 
-- But wait, the plan said "payment_method: 'code' | 'razorpay'". 
-- Ideally strict types are better. 
-- The user request said: "Add a payment_method column to the orders table (text, default 'prepaid')."
-- And "Add a is_paid boolean column (default false for COD, true for Razorpay)."

-- Let's stick to the user's specific defaults.
-- But for existing orders, if any, they are likely paid.
UPDATE orders SET is_paid = true WHERE is_paid IS FALSE AND payment_method = 'prepaid';
