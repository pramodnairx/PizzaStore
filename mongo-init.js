print('Start #################################################################');

db = db.getSiblingDB('kitchen');
db.createUser(
  {
    user: 'kitchen-svc',
    pwd: 'kitchen-svc-pwd',
    roles: [{ role: 'readWrite', db: 'kitchen' }],
  },
);
db.createCollection('users');

db = db.getSiblingDB('orders');
db.createUser(
  {
    user: 'order-svc',
    pwd: 'order-svc-pwd',
    roles: [{ role: 'readWrite', db: 'orders' }],
  },
);
db.createCollection('users');

db = db.getSiblingDB('storefront');
db.createUser(
  {
    user: 'storefront-svc',
    pwd: 'storefront-svc-pwd',
    roles: [{ role: 'readWrite', db: 'storefront' }],
  },
);
db.createCollection('users');

print('END #################################################################');