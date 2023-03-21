db.createUser(
    {
        user: "kitchen-svc",
        pwd: "kitchen-svc-pwd",
        roles: [
            {
                role: "readWrite",
                db: "kitchen"
            }
        ]
    }
);