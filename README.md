### PostgreSQL Database Details to Metis GitHub Action

##### This GitHub Action collects and sends various PostgreSQL database details to  Metis. It can collect the following:

 - Schemas structure
 - Available Extensions
 - Query statistics
 - Table statistics
 - Index Usage
 - Slow query log
 - Database configuration

### Inputs
 - db_connection_string (required)
The connection string of the database you want to monitor.

 - metis_api_key (required)
The API key for the Metis service you want to send the database details to.

 - metis_exporter_url (required)
The URL for the Metis exporter.

 - target_url (required)
The URL for your Metis instance.

 - foreign_table_name
The name of the table where the slow query log is saved. If not set, the slow query log data will not be collected.

### Outputs
This GitHub Action has no outputs.