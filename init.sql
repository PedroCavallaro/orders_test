CREATE TABLE orders (
    id UUID PRIMARY KEY,
    status VARCHAR(50) NOT NULL,
    amount NUMERIC(12,2) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);


CREATE TABLE outbox_events (
    id UUID PRIMARY KEY,
    event_data TEXT NOT NULL,
    published BOOLEAN NOT NULL,
    order_id UUID NOT NULL,
    dead BOOLEAN NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);


CREATE TABLE invoices (
    id UUID PRIMARY KEY,
    order_id UUID NOT NULL,
    amount NUMERIC(12,2) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);


CREATE TABLE processed_events (
    event_key VARCHAR(255) PRIMARY KEY,
    processed_at TIMESTAMP NULL,
    queue_attempts INT NOT NULL 
);
