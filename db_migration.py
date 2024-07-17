"""
Author: Alex Yu
File: db_migration.py
Created: 10/6/23
"""

import sqlalchemy as sql
import fdb
import pandas as pd
import psycopg
import os
import datetime
import time
import logging 
import numpy as np
import sys
from ast import literal_eval
import locale
import csv
import io
import fdb.fbcore
from pathlib import Path
import json

class Database:
    """
    Database Class that performs various functions related to the database migration.
    """

    def __init__(self):
        
        # initialize firebird and Postgres DB connections
        # connection info has been replaced for security
        self.fb_con = fdb.connect(
            host='test',
            database='test',
            port=1111,
            user='test',
            password='test'
        )

        # initialize secondary firebird connection with win1252 chartype
        # connection info has been replaced for security
        self.fb_con_win1252 = fdb.connect(
            host='test',
            database='test',
            port=1111,
            user='test',
            password='test',
            charset='win1252'
        )



        # table name is "test" for now
        # connection string modified for psycopg3
        # local host connection string
        # connection info has been replaced for security
        server_con = "postgresql+psycopg://test:test@test/test"
        self.postgres_con = sql.create_engine(server_con, client_encoding='utf-8')

        # main directory to store log and csv files
        self.dir = 'C:\dev\DB_Conversion'
    
    # def declare_dtypes(self):
    #     """
    #     Declares data types for each table in the FireBird db and returns it.

    #     Parameters
    #     -----------
    #     None.

    #     Returns
    #     -------
    #     dtypes
    #         dictionary of data types for each table.
    #     """
    #     dtypes = {
    #         'PARTS' : {
    #             ''
    #         }
    #     }


    def export_tables(self, tables):
        """
        Exports the given list of tables from the Firebird DB into the PostgreSQL DB.

        Parameters 
        ----------
        tables
            List of firebird SQL tables to export into the PostgreSQL db.
        
        Returns
        -------
        None.
        """

        total_table_count = len(tables)
        export_success_count = 0
        export_fail_count = 0

        # append today's date to the filename
        cur_date = datetime.datetime.today().strftime('%Y-%m-%d')
        filename = 'export_log_' + cur_date + '.txt' 
        filepath = os.path.join(self.dir, 'log', filename)

        # open the log file to write the exception statements
        f = open(filepath, "w")

        # measure the starting point
        start_time = time.time()
        time_formatted = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(start_time))

        # write the starting time of export
        print("Export started at: %s " % time_formatted)
        f.write("Export started at: %s \n" % time_formatted)

        # list of tables that export failed
        failed_tables = []
        
        # loop through all tables in the firebird db and export each of them into postgresql db
        for table in tables:
            print("Table " + table + " Export started")
            f.write("Table " + table + " Export started\n")

            # get the primary key of each table
            # primary_key = get_primary_key(table)
            df_list = []

            try:
                sql = (
                    "SELECT * "
                    "FROM " + table
                )

                # create an inner loop to read in each table by chunk
                for df in pd.read_sql_query(sql, self.fb_con, chunksize=10000, errors='replace'):
                    df_list.append(df)
                
                # concatenate all dataframe chunks
                df_merged = pd.concat(df_list, ignore_index=True)

                # take care of blobreader error for CUST & WORKER table
                if table == "CUST":

                    # cast the notes column to string to avoid blobreader error
                    df_merged['NOTES'] = df_merged['NOTES'].astype('string')
                    # df_merged.astype({'NOTES': 'string'})
                
                elif table == 'WORKER':

                    # drop the sign column to avoid blobreader error
                    # do operation in-place
                    df_merged.drop(columns=['SIGN'], inplace=True)
                # print(df_merged.info())

                # strip whitespaces from the dataframe
                df_trimmed = df_merged.apply(lambda x: x.astype("string").str.strip() if x.dtype == "object" else x)
                    
                # export dataframe into the target db
                with self.postgres_con.begin() as connection:

                    # use chunksize of 5000 and 'multi' method to avoid memory error
                    # use dictionary for dtype of new table in the PostgreSQL DB
                    df_trimmed.to_sql(
                        name=table,
                        con=connection,
                        if_exists='replace',
                        index=False,
                        chunksize=10000
                    )

                    # delete merged dataframe to free the memory space
                    #del df_merged
                
                export_success_count += 1
                print("Table " + table + " Export Complete!")
                f.write("Table " + table + " Export Complete!\n")
            
            # stop the loop if keyboard pressed
            except KeyboardInterrupt:
                break

            # for other exceptions, print the error statement
            except Exception as ex:
                print("Table " + table + " Export Failed!")
                template = "An exception of type {0} occurred. Arguments:\n{1!r}"
                message = template.format(type(ex).__name__, ex.args)
                print(message)
                export_fail_count += 1

                # store the failed table
                failed_tables.append(table)

                # print out the error statements in the log file
                f.write("Table " + table + " Export Failed!\n")
                f.write(message + "\n") 
        
        # measure in minutes
        end_time = time.time()
        time_formatted = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(end_time))
        print("Export ended at: %s" % time_formatted)
        print("Export time taken in minutes : %.2f" % ((end_time-start_time)/60))
        
        # write the summary of export
        f.write("Total number of tables %s\n" % total_table_count)
        f.write("Export Success Count: %s\n" % export_success_count)
        f.write("Export Fail Count: %s\n" % export_fail_count)
        f.write("Failed tables: %s\n" % ', '.join([str(table) for table in failed_tables]))
        f.write("Export ended at: %s\n" % time_formatted)
        f.write("Export time taken in minutes : %.2f\n" % ((end_time-start_time)/60))
        f.close()


    def get_primary_key(self, table_name):
        """
        Returns the primary key of the given table.

        Parameters 
        ----------
        table_name : string
            Name of the table in the database for which to find the primary key.
        
        Returns
        -------
        string
            The primary key of the table.
        """
        
        # create a Cursor object that operates in the context of Connection con:
        cur = self.fb_con.cursor()

        # firebird SQL query to find the primary key of the given table
        sql = (
            "SELECT s.rdb$field_name "
            "FROM rdb$index_segments AS s "
            "LEFT JOIN rdb$relation_constraints AS rc ON (rc.rdb$index_name = s.rdb$index_name) "
            "WHERE rc.rdb$relation_name = ? "
            "AND rc.rdb$constraint_type = 'PRIMARY KEY'"

        )

        # execute the query
        cur.execute(
            sql, (table_name,)
        )

        # save result tuple; just retrieve the first item
        res = cur.fetchone()[0]

        return res.strip()


    def execute_query(self, language, sql_query, filename, table_name):
        """
        Executes a SQL query.

        Parameters 
        ----------
        language : string
            DB engine name.
        sql_query : string
            SQL query string.
        filename : string
            filename for the csv file that stores the result of the SQL query.
        
        Returns
        -------
        None.
        """    

        if language == 'firebird':
            con = self.fb_con
            dir = os.path.join(self.dir, 'query_results', 'firebird')

        elif language == 'postgres':
            con = self.postgres_con
            dir = os.path.join(self.dir, 'query_results', 'postgres')

        else:
            print("Given language is not supported!")

            # stop the function if unsupported language is given
            return
        
        # read Dataframe by chunk
        df_list = []
        try:
            for df in pd.read_sql_query(sql_query, con, chunksize=10000):
                df_list.append(df)
        except:
            pass
        df_merged = pd.concat(df_list, ignore_index=True)
        # df_merged = pd.read_sql_query(sql_query, con)

        # filepath to store the generated csv file from the dataframe
        filepath = os.path.join(dir, filename)

        # separate the column by comma
        # don't print out the row index
        # use UTF8 with BOM
        df_merged.to_csv(filepath, sep=',', encoding='utf-8-sig', index=False)
        # with self.postgres_con.begin() as connection:
        #     df_merged.to_sql(
        #         name=table_name,
        #         con=connection,
        #         if_exists='replace',
        #         index=False,
        #         chunksize=10000
        #     )


    def compare_table(self, table_name, write_csv=False):
        """
        Compares the two DataFrames from the Firebird and PostgreSQL DB.

        Parameters 
        ----------
        table_name : string
            Name of the table to compare.
        write_csv : boolean
            Whether to write the selected table to csv files
        
        Returns
        -------
        boolean
            Whether the two tables are equal.
        """

        # get the primary key to use it for sorting
        primary_key = self.get_primary_key(table_name)
        print("Primary key of the table " + table_name + " is " + primary_key)
        
        # SQL queryes to extract all data from the given table
        fb_query = (
            "SELECT * "
            "FROM " + table_name
        )
        postgres_query = (
            'SELECT * '
            'FROM public."' + table_name + '"'
        )

        # dataframe chunk lists to concatenate
        fb_df_list = []
        postgres_df_list = []

        # build DataFrames for each db; use chunksize = 10000
        print("Building firebird DataFrame chunks")
        for df in pd.read_sql_query(fb_query, self.fb_con, chunksize=10000):
            fb_df_list.append(df)
        print("Firebird DataFrame Build Complete!")
        
        print("Building Postres DataFrame chunks")
        for df in pd.read_sql_query(postgres_query, self.postgres_con, chunksize=10000):
            postgres_df_list.append(df)
        print("Postgres DataFrame Build Complete!")

        # merge the dataframe chunk lists
        fb_df_merged = pd.concat(fb_df_list, ignore_index=True)
        postgres_df_merged = pd.concat(postgres_df_list, ignore_index=True)
        
        # sort the merged dataframes to compare for equality between two db tables
        fb_df_sorted = fb_df_merged.sort_values(by=[primary_key])
        postgres_df_sorted = postgres_df_merged.sort_values(by=[primary_key])

        # export the DataFrames into csv files
        if write_csv:

            fb_filename = 'fb_' + table_name + '.csv'
            postgres_filename = 'postgres_' + table_name + '.csv' 

            fb_filepath = os.path.join(self.dir, 'db_tables', 'firebird', fb_filename)
            postgres_filepath = os.path.join(self.dir, 'db_tables', 'postgres', postgres_filename)

            fb_df_sorted.to_csv(fb_filepath, sep=',', encoding='utf-8-sig', index=False, chunksize=10000)
            postgres_df_sorted.to_csv(postgres_filepath, sep=',', encoding='utf-8-sig', index=False, chunksize=10000)

        print('--------------')
        print('DataFrame Shapes: ')
        print(fb_df_sorted.shape, postgres_df_sorted.shape)

        # drop index from the DataFrames
        fb_df_sorted.reset_index(drop=True, inplace=True)
        postgres_df_sorted.reset_index(drop=True, inplace=True)


        # return whether the two dataframes are equal
        return pd.testing.assert_frame_equal(
            fb_df_sorted,
            postgres_df_sorted, 
            check_dtype=False, 
            check_index_type=False,
            by_blocks=True
            )
        # return np.array_equal(fb_df_sorted.values, postgres_df_sorted.values)
        #return fb_df_sorted.equals(postgres_df_sorted)


    def get_tables(self, db_engine):
        """
        Returns all the tables in the given database.

        Parameters 
        ----------
        db_engine.
        
        Returns
        -------
        list
            List of tables in the database.
        """
        if db_engine == "firebird":
            
            # get all the table names in firebird db
            schema = fdb.schema.Schema()
            schema.bind(self.fb_con)
            tables = [t.name for t in schema.tables]

            return tables
        
        # return table names in postgresql database
        else:
            meta = sql.MetaData()
            meta.reflect(bind=self.postgres_con)
            
            return list(meta.tables.keys())

    def export_to_csv(self, table_name):
        """
        Exports the given table in the firebird SQL db to a csv file.

        Parameters
        ----------
        table_name
            string : name of the table to export to csv file.
        
        Returns
        -------
        None.
        """

        # append today's date to the csv filename
        cur_date = datetime.datetime.today().strftime('%Y-%m-%d')
        filename = table_name + '_' + cur_date + '_v1.csv'
        filepath = os.path.join(self.dir, 'fb_to_csv', filename)

        # DataFrame chunk list to concatenate
        df_list = []

        try:
            sql = (
                "SELECT * "
                "FROM " + table_name
            )

            # create an inner loop to read in DataFrame by chunks
            for df in pd.read_sql_query(sql, self.fb_con, chunksize=10000):
                df_list.append(df)
            
            # merge the DataFrame chunks and write it to csv file
            df_merged = pd.concat(df_list, ignore_index=True)

            # separate the column by comma
            # don't print out the row index
            # use UTF8 with BOM
            df_merged.to_csv(filepath, sep=',', encoding='utf-8-sig', index=False)

        # for other exceptions, print the error statement
        except Exception as ex:
            print("Table " + table_name + " CSV Export Failed!")
            template = "An exception of type {0} occurred. Arguments:\n{1!r}"
            message = template.format(type(ex).__name__, ex.args)
            print(message)
    

    def export_to_csv_v2(self, filepath, table_name):
        """
        Exports the given table in the Firebird DB to a csv file without using pandas DataFrame.

        Parameters
        ----------
        table_name:
            string : name of the table to export to a csv file.
        
        Returns
        -------
        None.
        """

        # creates a cursor object and execute the SELECT query in the given table
        cur = self.fb_con.cursor()
        cur.execute('SELECT * FROM ' + table_name)
       
        # stores headers of the table
        headers = [fieldDesc[fdb.DESCRIPTION_NAME] for fieldDesc in cur.description]
        types = [fieldDesc[fdb.DESCRIPTION_TYPE_CODE] for fieldDesc in cur.description]

        # number of skipped records
        skipped_rows = 0

        with open(filepath, 'w', errors='ignore', newline='', encoding='utf-8-sig') as f:
            writer = csv.writer(f, delimiter=',')
            writer.writerow(headers)

            row = cur.fetchone()
            while row:
                parsed = []
                cur_row = list(row)
                for i, field in enumerate(cur_row):

                    # write an empty string for null values or worker table's sign column
                    if field == None or (table_name == 'WORKER' and headers[i] == 'SIGN'):
                        parsed.append('')

                    # read blobreader object
                    elif type(field) == fdb.fbcore.BlobReader:
                        parsed.append(field.read())
                    
                    # decode bytes
                    elif type(field) == bytes:
                        parsed.append(field.decode("cp949", "backslashreplace"))
                        
                    # strip beginning and trailing whitespaces from strings
                    elif type(field) == str:
                        parsed.append(field.strip())
                    
                    # for everything else, just add it as it is
                    else:
                        parsed.append(field)
                                
                writer.writerow(parsed)

                # try fetch the next row of the query result
                try:
                    row = cur.fetchone()
    
                except Exception as ex:
                    print('error found at ', row[0])
                    template = "An exception of type {0} occurred. Arguments: \n{1!r}"
                    message = template.format(type(ex).__name__, ex.args)
                    print(message)

                    # ! this cannot be continue in order to keep retrieving rows
                    skipped_rows += 1
                    continue
                    # pass
        f.close()

        return skipped_rows

    def export_to_csv_v3(self, filepath, table_name):
        """
        Exports the given table in the Firebird DB to a csv file without using pandas DataFrame; fixes the duplicate of rows with decode errors

        Parameters
        ----------
        table_name:
            string : name of the table to export to a csv file.
        
        Returns
        -------
        None.
        """

        # creates a cursor object and execute the SELECT query in the given table
        cur = self.fb_con.cursor()
        cur.execute('SELECT * FROM ' + table_name)
       
        # stores headers of the table
        headers = [fieldDesc[fdb.DESCRIPTION_NAME] for fieldDesc in cur.description]

        # number of skipped records
        errors = 0

        with open(filepath, 'w', errors='ignore', newline='', encoding='utf-8-sig') as f:
            writer = csv.writer(f, delimiter=',')
            writer.writerow(headers)

            while True:
                # try fetch the next row of the query result
                try:
                    row = cur.fetchone()

                    # break out of loop if there is no more row to fetch
                    if row is None:
                        break
                    parsed = []
                    cur_row = list(row)
                    for i, field in enumerate(cur_row):

                        # write an empty string for null values or worker table's sign column
                        if field == None or (table_name == 'WORKER' and headers[i] == 'SIGN'):
                            parsed.append('')

                        # read blobreader object
                        elif type(field) == fdb.fbcore.BlobReader:
                            parsed.append(field.read())
                        
                        # decode bytes
                        elif type(field) == bytes:
                            parsed.append(field.decode("cp949", "ignore"))
                            
                        # strip beginning and trailing whitespaces from strings
                        elif type(field) == str:
                            parsed.append(field.strip())
                        
                        # for everything else, just add as it is
                        else:
                            parsed.append(field)
                                    
                    writer.writerow(parsed)
    
                except Exception as ex:

                    # writer.writerow(list(cur.fetchone()))
                    
                    # template = "An Exporting exception of type {0} occurred. Arguments: \n{1!r}"
                    # message = template.format(type(ex).__name__, ex.args)
                    # print(message)

                    # increment the number of skipped rows and continue to next row
                    errors += 1
                    
        f.close()

        return errors
                
    def import_csv(self, filepath, table_name, option="replace"):
        """
        Reads a csv file into a dataframe and then insert the dataframe into the PostgreSQL database.

        Parameters
        ----------
        filepath : string
            File path of the csv file to read and import into the PostgreSQL database.
        
        table_name : string
            Table name to import into the PostgreSQL database.

        primary_keys: dictionary
            firebird database primary keys dictionary
        
        Returns
        -------
        None.
        """

        df_list = []

        # ignore encoding errors for now
        # low_mermory set to False to ensure no mixed types
        for chunk in pd.read_csv(filepath, chunksize=10000, low_memory=False):
            df_list.append(chunk)
        
        df_merged = pd.concat(df_list, ignore_index=True)

        with self.postgres_con.begin() as connection:

            # read the dataframe
            df_merged.to_sql(
                name=table_name,
                con=connection,
                if_exists=option,
                index=False,
                chunksize=10000
            )
        connection.commit()
            

    def export_tables_v2(self):
        """
        1) Export tables from firebird database to csv files.
        2) Import the csv files into postgresql tables.
        """

        # retrieve tables names from the firebird database
        schema = fdb.schema.Schema()
        schema.bind(self.fb_con)
        tables = [t.name for t in schema.tables]

        # retrieve the primary keys from the firebird database
        primary_keys = self.get_primary_keys()

        # ! for tesing only; delete afterwards
        tables = ["SHIPMENT"]

        # initialize variables for the log file
        total_table_count = len(tables)
        export_success_count = 0
        export_fail_count = 0
        import_success_count = 0
        import_fail_count = 0
        export_fail_tables = []
        import_fail_tables = []

        # use today's date as the containing folder for the csv file
        cur_date = datetime.datetime.today().strftime('%Y-%m-%d')
        directory = os.path.join(self.dir, 'fb_to_csv', cur_date)

        # make a folder for today's date if it already doesn't exist
        try:
            Path(directory).mkdir(exist_ok=False)
        except:
            pass

        # measure the starting point
        start_time = time.time()
        time_formatted = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(start_time))
        log_time = time.strftime("%H-%M-%S", time.localtime(start_time))

        # write a log file
        log_filepath = os.path.join(directory, 'log_' + log_time + '.txt')
        
        # open the log file to write the exception statements
        log_file = open(log_filepath, "w")

        # write the starting time of export
        print("Export started at: %s " % time_formatted)
        log_file.write("Export started at: %s \n" % time_formatted)

        for table in tables:
            filename = table + '.csv'
            filepath = os.path.join(directory, filename)

            try:
                skipped_rows = self.export_to_csv_v4(filepath, table)
                # skipped_rows = self.export_to_csv_v3(filepath, table)
                print("Table " + table + " Export Complete!")
                log_file.write("Table " + table + " Export Complete!\n")
                log_file.write("Number of errors: %s\n" % skipped_rows)
                export_success_count += 1

                try:
                    self.import_csv(filepath, table)
                    import_success_count += 1
                    print("Table " + table + " Import Complete!")
                    log_file.write("Table " + table + " Import Complete!\n")

                except Exception as import_ex:
                    template = "An exception of type {0} occurred. Arguments:\n{1!r}"
                    message = template.format(type(import_ex).__name__, import_ex.args)
                    print(message)

                    import_fail_count += 1
                    # store the failed table
                    import_fail_tables.append(table)
                    print("Table " + table + " Import Failed!")
                    log_file.write("Table " + table + " Import Failed!\n")

            except Exception as ex:
                export_fail_count += 1
                export_fail_tables.append(table)
                print("Table " + table + " Export Failed!")
                template = "An exception of type {0} occurred. Arguments:\n{1!r}"
                message = template.format(type(ex).__name__, ex.args)

                # print out the error statements in the log file
                log_file.write("Table " + table + " Export Failed!\n")
                log_file.write(message + "\n")
                
        
        # measure in minutes
        end_time = time.time()
        time_formatted = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(end_time))
        print("Export ended at: %s" % time_formatted)
        print("Export time taken in minutes : %.2f" % ((end_time-start_time)/60))
        
        # write the summary of export
        log_file.write("Total number of tables %s\n" % total_table_count)
        log_file.write("Export Success Count: %s\n" % export_success_count)
        log_file.write("Export Fail Count: %s\n" % export_fail_count)
        log_file.write("Export Success Count: %s\n" % import_success_count)
        log_file.write("Export Fail Count: %s\n" % import_fail_count)
        log_file.write("Export Failed tables: %s\n" % ', '.join([str(table) for table in export_fail_tables]))
        log_file.write("Import Failed tables: %s\n" % ', '.join([str(table) for table in import_fail_tables]))
        log_file.write("Export ended at: %s\n" % time_formatted)
        log_file.write("Export time taken in minutes : %.2f\n" % ((end_time-start_time)/60))
        log_file.close()
    
    def create_sequences(self):
        # retrieve table names first
        table_names = self.get_tables("pg")

        # create a MetaData object
        meta = sql.MetaData()

        for table_name in table_names:
            table = sql.Table(table_name, meta, autoload=True, autoload_with=self.postgres_con)

            max_id = table.select(sql.func(max(table.c.id)).scalar())
    
    def get_primary_keys(self):
        cursor = self.fb_con.cursor()
        cursor.execute(
            """
                SELECT
                    r.RDB$RELATION_NAME,
                    seg.RDB$FIELD_NAME
                FROM
                    RDB$RELATION_CONSTRAINTS r
                    JOIN RDB$INDEX_SEGMENTS seg ON r.RDB$INDEX_NAME = seg.RDB$INDEX_NAME
                WHERE
                    r.RDB$CONSTRAINT_TYPE = 'PRIMARY KEY'
            """
        )

        # Below tables have primary keys; manually assign the primary key for migration into postgresql.
        multiple_primary_key_tables = {
            "CRFQITEM": "QIID", 
            "CUSTPO": "CPID", 
            "MISCPO": "MPID", 
            "POITEMS": "OIID",
            "VINVOICE": "VNID",
            "VITEM": "VIID",
            "VPO": "VPID"
        }

        primary_keys = cursor.fetchall()
        primary_keys_dict = {}
        for key in primary_keys:

            # remove whitespaces from the table name and primary keys
            table = key[0].strip()
            primary_key = key[1].strip()
            if not primary_key:
                # skip tables without primary key column
                continue

            elif table in multiple_primary_key_tables:
                primary_keys_dict[table] = multiple_primary_key_tables[table]

            else:
                primary_keys_dict[table] = primary_key
        # self.fb_con.close()
        
        return primary_keys_dict

    def get_differences(self):
        # retrieve table names and primary keys
        tables = self.get_tables("firebird")
        primary_keys = self.get_primary_keys()

        # initialize unqiue id dictionaries
        fb_ids = {}
        pg_ids = {}
        id_differences = {}
        
        # initialize firebird cursor
        fb_cur = self.fb_con.cursor()

        for table in tables:

            # skip tables without primary keys
            if table not in primary_keys:
                continue

            # retrieve unique ids from firebird tables
            fb_cur.execute(f"SELECT DISTINCT {primary_keys[table]} FROM {table}")
            rows = fb_cur.fetchall()
            fb_ids[table] = [row[0] for row in rows]

            # retrieve unique ids from postgresql table
            with self.postgres_con.begin() as connection:
                result = connection.execute(sql.text(f'SELECT DISTINCT "{primary_keys[table]}" FROM "{table}"'))
                rows = result.fetchall()
                pg_ids[table] = [row[0] for row in rows]
            
            differences = list(set(fb_ids[table]) - set(pg_ids[table]))
            if len(differences) > 0:
                id_differences[table] = differences
        
        # use today's date as the containing folder for the csv file
        cur_date = datetime.datetime.today().strftime('%Y-%m-%d')
        directory = os.path.join(self.dir, 'difference_map', cur_date)

        # make a folder for today's date if it already doesn't exist
        try:
            Path(directory).mkdir(exist_ok=False)
        except:
            pass

        # write out the difference map to csv file
        filepath = os.path.join(directory, 'difference.json')
        with open(filepath, 'w') as f:
            json.dump(id_differences, f)
        
        f.close()
        return id_differences
    
    def add_primary_keys(self):
        """
        Add primary key to tables in postgresql database.
        """

        # retrieve tables names from the firebird database
        schema = fdb.schema.Schema()
        schema.bind(self.fb_con)
        tables = [t.name for t in schema.tables]

        # retrieve the primary keys from the firebird database
        primary_keys = self.get_primary_keys()

        for table in tables:
            # skip 'PREFIX' table since it doesn't have a primary key column
            if table == 'PREFIX': continue
            primary_key_column = primary_keys[table]

            with self.postgres_con.begin() as connection:
                check_statement = f"SELECT constraint_name FROM information_schema.table_constraints WHERE table_name = '{table}' AND constraint_type = 'PRIMARY KEY';"
                result = connection.execute(sql.text(check_statement))
                primary_key_exists = result.fetchone() is not None

                if not primary_key_exists:
                    try:
                        add_statement = f'ALTER TABLE "{table}" ADD PRIMARY KEY ("{primary_key_column}");'
                        connection.execute(sql.text(add_statement))
                        print("Table " + table + " adding primary key succeeded!\n")
 
                    except Exception as ex:
                        template = "An exception of type {0} occurred. Arguments:\n{1!r}"
                        message = template.format(type(ex).__name__, ex.args)
                        print("Table " + table + "adding primary key failed!\n")
                        print(message)


    def export_tables_utf8(self):
        # retrieve difference dictionary from json file
        cur_date = datetime.datetime.today().strftime('%Y-%m-%d')
        filepath = os.path.join(self.dir, 'difference_map', cur_date, 'difference.json')
        with open(filepath, "r") as f:
            difference_map = json.load(f)
        
        # establish connection to firebird database with utf8 charset
        # connection params replaced for security=
        fb_con = fdb.connect(
            host='test',
            database='test',
            port=1111,
            user='test',
            password='test',
            charset='win1252'
        )

        tables = self.get_tables("firebird")
        # ! for testing purpose; remove for production
        # tables = ["CUST"]

        primary_keys = self.get_primary_keys()

        # initialize variables for the log file
        total_table_count = len(tables)
        export_success_count = 0
        export_fail_count = 0
        import_success_count = 0
        import_fail_count = 0
        export_fail_tables = []
        import_fail_tables = []

        # use today's date as the containing folder for the csv file
        cur_date = datetime.datetime.today().strftime('%Y-%m-%d')
        directory = os.path.join(self.dir, 'fb_to_csv_utf8', cur_date)

        # make a folder for today's date if it already doesn't exist
        try:
            Path(directory).mkdir(exist_ok=False)
        except:
            pass

        # measure the starting point
        start_time = time.time()
        time_formatted = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(start_time))
        log_time = time.strftime("%H-%M-%S", time.localtime(start_time))

        # write a log file
        log_filepath = os.path.join(directory, 'log_' + log_time + '.txt')
        
        # open the log file to write the exception statements
        log_file = open(log_filepath, "w")

        # write the starting time of export
        print("Export started at: %s " % time_formatted)
        log_file.write("Export started at: %s \n" % time_formatted)

        for table in tables:
            filename = table + '.csv'
            filepath = os.path.join(directory, filename)

            try:
                skipped_rows = self.export_to_csv_utf8(fb_con, filepath, table, primary_keys, difference_map)
                print("Table " + table + " Export Complete!")
                log_file.write("Table " + table + " Export Complete!\n")
                log_file.write("Number of errors: %s\n" % skipped_rows)
                export_success_count += 1

                try:
                    # simply append to the existing table
                    self.import_csv(filepath, table, option="append")
                    import_success_count += 1
                    print("Table " + table + " Import Complete!")
                    log_file.write("Table " + table + " Import Complete!\n")

                except Exception as import_ex:
                    template = "An exception of type {0} occurred. Arguments:\n{1!r}"
                    message = template.format(type(import_ex).__name__, import_ex.args)
                    print(message)

                    import_fail_count += 1
                    # store the failed table
                    import_fail_tables.append(table)
                    print("Table " + table + " Import Failed!")
                    log_file.write("Table " + table + " Import Failed!\n")

            except Exception as ex:
                export_fail_count += 1
                export_fail_tables.append(table)
                print("Table " + table + " Export Failed!")
                template = "An exception of type {0} occurred. Arguments:\n{1!r}"
                message = template.format(type(ex).__name__, ex.args)

                # print out the error statements in the log file
                log_file.write("Table " + table + " Export Failed!\n")
                log_file.write(message + "\n")
                
        
        # measure in minutes
        end_time = time.time()
        time_formatted = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(end_time))
        print("Export ended at: %s" % time_formatted)
        print("Export time taken in minutes : %.2f" % ((end_time-start_time)/60))
        
        # write the summary of export
        log_file.write("Total number of tables %s\n" % total_table_count)
        log_file.write("Export Success Count: %s\n" % export_success_count)
        log_file.write("Export Fail Count: %s\n" % export_fail_count)
        log_file.write("Export Success Count: %s\n" % import_success_count)
        log_file.write("Export Fail Count: %s\n" % import_fail_count)
        log_file.write("Export Failed tables: %s\n" % ', '.join([str(table) for table in export_fail_tables]))
        log_file.write("Import Failed tables: %s\n" % ', '.join([str(table) for table in import_fail_tables]))
        log_file.write("Export ended at: %s\n" % time_formatted)
        log_file.write("Export time taken in minutes : %.2f\n" % ((end_time-start_time)/60))
        log_file.close()

    
    def export_to_csv_utf8(self, connection, filepath, table_name, primary_keys, difference_map):
        """
        Exports the given table in the Firebird DB to a csv file without using pandas DataFrame; fixes the duplicate of rows with decode errors

        Parameters
        ----------
        table_name:
            string : name of the table to export to a csv file.
        
        Returns
        -------
        None.
        """

        # creates a cursor object and execute the SELECT query in the given table
        cur = connection.cursor()
        cur.execute(f"SELECT * FROM {table_name} WHERE {primary_keys[table_name]} IN ({','.join(map(str, difference_map[table_name]))})")
       
        # stores headers of the table
        headers = [fieldDesc[fdb.DESCRIPTION_NAME] for fieldDesc in cur.description]
        # types = [fieldDesc[fdb.DESCRIPTION_TYPE_CODE] for fieldDesc in cur.description]
        # print('column types: %s \n' % types)

        # number of skipped records
        errors = 0

        with open(filepath, 'w', errors='ignore', newline='', encoding='utf-8') as f:
            writer = csv.writer(f, delimiter=',')
            writer.writerow(headers)

            while True:
                # try fetch the next row of the query result
                try:
                    row = cur.fetchone()

                    # break out of loop if there is no more row to fetch
                    if row is None:
                        break
                    parsed = []
                    cur_row = list(row)
                    for i, field in enumerate(cur_row):

                        # write an empty string for null values or worker table's sign column
                        if field == None or (table_name == 'WORKER' and headers[i] == 'SIGN'):
                            parsed.append('')

                        # read blobreader object
                        elif type(field) == fdb.fbcore.BlobReader:
                            parsed.append(field.read())
                        
                        # decode bytes
                        elif type(field) == bytes:
                            parsed.append(field.decode("cp949", "ignore"))
                            
                        # strip beginning and trailing whitespaces from strings
                        elif type(field) == str:
                            parsed.append(field.strip())
                            
                        # for everything else, just add as it is
                        else:
                            parsed.append(field)
                                    
                    writer.writerow(parsed)
    
                except Exception as ex:
                    
                    template = "An Exporting exception of type {0} occurred. Arguments: \n{1!r}"
                    message = template.format(type(ex).__name__, ex.args)
                    print(message)

                    # increment the number of skipped rows and continue to next row
                    errors += 1
        f.close()

        return errors

    def export_to_csv_v4(self, filepath, table_name):
        """
        Exports the given table in the Firebird DB to a csv file without using pandas DataFrame; fixes the duplicate of rows with decode errors

        Parameters
        ----------
        table_name:
            string : name of the table to export to a csv file.
        
        Returns
        -------
        None.
        """

        # creates a cursor object and execute the SELECT query in the given table
        cur = self.fb_con.cursor()
        cur_win1252 = self.fb_con_win1252.cursor()

        cur.execute('SELECT * FROM ' + table_name)
        cur_win1252.execute('SELECT * FROM ' + table_name )

        # stores headers of the table
        headers = [fieldDesc[fdb.DESCRIPTION_NAME] for fieldDesc in cur.description]
        # types = [fieldDesc[fdb.DESCRIPTION_TYPE_CODE] for fieldDesc in cur.description]
        # print('column types: %s \n' % types)

        # number of skipped records
        errors = 0

        with open(filepath, 'w', errors='ignore', newline='', encoding='utf-8-sig') as f:
            writer = csv.writer(f, delimiter=',')
            writer.writerow(headers)

            while True:
                # try fetch the next row of the query result
                try:
                    # fetch win1252 connection's cursor first
                    row_win1252 = cur_win1252.fetchone()
                    row = cur.fetchone()

                    # break out of loop if there is no more row to fetch
                    if row is None:
                        break
                    parsed = []
                    cur_row = list(row)
                    for i, field in enumerate(cur_row):

                        # write an empty string for null values or worker table's sign column
                        if field == None or (table_name == 'WORKER' and headers[i] == 'SIGN'):
                            parsed.append('')

                        # read blobreader object
                        elif type(field) == fdb.fbcore.BlobReader:
                            parsed.append(field.read())
                        
                        # decode bytes
                        elif type(field) == bytes:
                            parsed.append(field.decode("cp949", "ignore"))
                            
                        # strip beginning and trailing whitespaces from strings
                        elif type(field) == str:
                            parsed.append(field.strip())
                        
                        # for everything else, just add as it is
                        else:
                            parsed.append(field)
                                    
                    writer.writerow(parsed)
    
                except Exception as ex:
                    parsed = []
                    cur_row = list(row_win1252)
                    for i, field in enumerate(cur_row):

                        # write an empty string for null values or worker table's sign column
                        if field == None or (table_name == 'WORKER' and headers[i] == 'SIGN'):
                            parsed.append('')

                        # read blobreader object
                        elif type(field) == fdb.fbcore.BlobReader:
                            parsed.append(field.read())
                        
                        # decode bytes
                        elif type(field) == bytes:
                            parsed.append(field.decode("cp1252"))
                            
                        # strip beginning and trailing whitespaces from strings
                        elif type(field) == str:
                            parsed.append(field.strip())
                        
                        # for everything else, just add as it is
                        else:
                            parsed.append(field)
                                    
                    writer.writerow(parsed)

                    # writer.writerow(list(cur.fetchone()))
                    
                    # template = "An Exporting exception of type {0} occurred. Arguments: \n{1!r}"
                    # message = template.format(type(ex).__name__, ex.args)
                    # print(message)

                    # increment the number of skipped rows and continue to next row
                    errors += 1
                    
        f.close()

        return errors

    def add_sequences(self):
        # retrieve table names in postgre database
        tables = self.get_tables("pg")

        # retrieve primary keys
        primary_keys = self.get_primary_keys()

        # Create a MetaData object
        meta = sql.MetaData()

        # loop through each table and add sequence based on the max value of primary key column
        with self.postgres_con.begin() as connection:
            for table_name in tables:
                # skip 'PREFIX' column since it doesn't have a primary key column
                if table_name == 'PREFIX': continue

                # primary key column name
                primary_id = primary_keys[table_name]

                query = f'SELECT MAX("{primary_id}") FROM "{table_name}";'
                result = connection.execute(sql.text(query))
                max_value = result.scalar()

                if max_value is None:
                    print(f"table {table_name}'s primary key {primary_id}'s max value is None.")
                    continue

                # create a sequence object
                sequence_name = f"{table_name}_{primary_id}_seq"
                sequence = sql.Sequence(sequence_name, start=max_value+1)

                # create the sequence in the database
                sequence.create(bind=self.postgres_con)

if __name__ == "__main__":

    # initialize the DataBase class
    db = Database()

    """
    Tables that have been manually transferred through csv files
    : PARTS, CUSTOMER, VENDOR, PAYTERM, CRFQ, CRFQITEM, VPO, CUSTPO, WORKER
    , POITEMS, SHIPMENT, VITME
    Updated on 1/23/24
    """
    # filepath for testing exporting table to csv files
    # filepath = os.path.join("C:\dev\DB_Conversion", "fb_to_csv", "crfq_test.csv")
    # db.export_to_csv_v2(filepath, "CRFQ")

    # csv_filepath = os.path.join("C:\dev\DB_Conversion", "fb_to_csv",  "CUST_2024-02-23_utf8.csv")
    # db.import_csv(csv_filepath, "CUST", "replace")

    
    """
    db migration process
    1. export_tables_v2(): export firebird tables to csv files and import them into postgre database
    2. get_differences(): compare the unique primary key ids between firebird and postgre
    3. add_primary_keys(): add primary keys to postgre tables
    4. add_sequences(): add sequence to each table
    """
    # db.export_tables_v2()
    # print(db.get_differences())
    # db.add_primary_keys()
    db.add_sequences()

    
