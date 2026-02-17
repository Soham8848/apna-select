-- Seed Data for Products

INSERT INTO public.products (name, category, price, compare_at_price, image_url, description)
VALUES
-- Electronics
('Transparent Cyberpunk Powerbank', 'Electronics', 49.99, 89.99, 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=800&q=80', 'High-capacity 20000mAh power bank with see-through design showing internal components. Fast charging support for all devices.'),
('Active Noise Cancelling Pods', 'Electronics', 59.99, 129.99, 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80', 'Immersive sound with industry-leading noise cancellation. 24-hour battery life with charging case.'),
('Ultra-Slim Mechanical Keyboard', 'Electronics', 84.99, 119.99, 'https://images.unsplash.com/photo-1587829741301-dc798b91add1?auto=format&fit=crop&w=800&q=80', 'Low profile mechanical keys with RGB backlighting. Wireless connectivity for a clean setup.'),

-- Tools
('48-in-1 Precision Steel Screwdriver Set', 'Tools', 24.99, 39.99, 'https://images.unsplash.com/photo-1581147036324-c17ac41fe91c?auto=format&fit=crop&w=800&q=80', 'Magnetic bit kit for electronics repair, DIY projects, and more. S2 steel bits for durability.'),
('Laser Digital Tape Measure', 'Tools', 34.99, 59.99, 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&w=800&q=80', 'Measure up to 130ft with extreme accuracy. Digital display and area calculation functions.'),
('Multi-Angle Universal Wrench', 'Tools', 19.99, 29.99, 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&w=800&q=80', 'One tool replaces an entire socket set. 360-degree rotating head for hard-to-reach places.'),

-- Home & Gift
('Levitating Moon Lamp', 'Home & Gift', 45.99, 79.99, 'https://images.unsplash.com/photo-1534234058165-37330536c641?auto=format&fit=crop&w=800&q=80', '3D printed moon replica that floats and rotates using magnetic levitation. Touch control for colors.'),
('Smart Temperature Coffee Mug', 'Home & Gift', 69.99, 99.99, 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=800&q=80', 'Keeps your drink at the perfect temperature for hours. App controlled via Bluetooth.'),
('Minimalist Concrete Planter Set', 'Home & Gift', 29.99, 44.99, 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=800&q=80', 'Hand-poured geometric concrete planters. Perfect for succulents and modern desk setups.'),

-- Accessories
('Anti-Theft Slim Backpack', 'Accessories', 39.99, 69.99, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80', 'Water-resistant with hidden zippers and USB charging port. Fits up to 15-inch laptops.'),
('Carbon Fiber Wallet', 'Accessories', 22.99, 45.00, 'https://images.unsplash.com/photo-1627123424574-18bd75f7267ce?auto=format&fit=crop&w=800&q=80', 'RFID blocking minimal wallet. Holds up to 12 cards and cash while staying slim.'),
('Titanium Key Organizer', 'Accessories', 18.99, 25.00, 'https://images.unsplash.com/photo-1582816247790-2683070cd529?auto=format&fit=crop&w=800&q=80', 'Stop key jingle and protect your phone from scratches. Holds 4-10 keys silently.');
