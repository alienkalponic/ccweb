using Newtonsoft.Json;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Net;
using System.Net.NetworkInformation;
using System.Text.Json;


namespace ProjectWeb.Domain.Utility
{
    public class Data
    {
        private static Dictionary<string, object> MainArr;
        private static List<Dictionary<string, object>> ParentArr;
        private static Dictionary<string, object> ChildArr;
        private static bool _Status = false;
        private static string _jsonString = string.Empty;
        //private static dynamic response;
        //private static JavaScriptSerializer _jsObj = new JavaScriptSerializer();
        private static DataTable dTable;


        /*********************************
          * Title :: Make DataTable to JSON String
          * Description :: 
          * Parameter :: Table Data
          * Return :: JSON String
          * Author::Arnab Das
          *********************************/
        public static string DatatableToJsonString(DataTable dt)
        {
            try
            {
                MainArr = new Dictionary<string, object>();
                if (dt.Rows.Count > 0)
                {
                    _Status = true;
                    ParentArr = new List<Dictionary<string, object>>();
                    foreach (DataRow row in dt.Rows)
                    {
                        ChildArr = new Dictionary<string, object>();
                        foreach (DataColumn column in dt.Columns)
                        {
                            ChildArr.Add(column.ColumnName, row[column]);
                        }
                        ParentArr.Add(ChildArr);
                    }
                    MainArr.Add("status", _Status);
                    MainArr.Add("response", ParentArr);
                }
                else
                {
                    MainArr.Add("status", _Status);
                    MainArr.Add("response", "No data found.");
                }
            }
            catch (Exception ex)
            {
                MainArr.Add("status", _Status);
                MainArr.Add("response", ex.Message);
            }
            return JsonConvert.SerializeObject(MainArr);
        }

        internal static Dictionary<string, object> Deserialize(object p, Type type)
        {
            throw new NotImplementedException();
        }

        /*********************************
         * Title :: Make Exception Message to JSON String
         * Description :: 
         * Parameter :: exception string
         * Return :: JSON String
         * Author::Arnab Das
         *********************************/
        public static string ExceptionToJsonString(string exceptionMessage)
        {

            try
            {
                MainArr = new Dictionary<string, object>();

                MainArr.Add("status", _Status);
                MainArr.Add("response", exceptionMessage);
            }
            catch (Exception ex)
            {
                MainArr.Add("status", _Status);
                MainArr.Add("response", ex.Message);
            }
            return JsonConvert.SerializeObject(MainArr);
        }
        /*********************************
          * Title :: Make Exception Object to JSON String
          * Description :: 
          * Parameter :: exception string
          * Return :: JSON String
          * Author::Arnab Das
          *********************************/
        public static string ObjectToJsonString(dynamic arraydata)
        {
            if (arraydata != null)
            {
                return JsonConvert.SerializeObject(arraydata);
            }
            else
            {
                return string.Empty;
            }
        }

        /*********************************
          * Title :: Make Datatable To JsonString_array
          * Description :: 
          * Parameter :: exception string
          * Return :: JSON String
          * Author::Arnab Das
          *********************************/
        public static string DatatableToJsonString_array(DataTable dt)
        {
            try
            {
                MainArr = new Dictionary<string, object>();
                ParentArr = new List<Dictionary<string, object>>();
                if (dt.Rows.Count > 0)
                {
                    foreach (DataRow row in dt.Rows)
                    {
                        ChildArr = new Dictionary<string, object>();
                        foreach (DataColumn column in dt.Columns)
                        {
                            ChildArr.Add(column.ColumnName, row[column]);
                        }
                        ParentArr.Add(ChildArr);
                    }

                }
                else
                {
                    MainArr.Add("status", _Status);
                    MainArr.Add("response", "No data found.");
                }
            }
            catch (Exception ex)
            {
                MainArr.Add("status", _Status);
                MainArr.Add("response", ex.Message);
            }
            return JsonConvert.SerializeObject(ParentArr);
        }

        /*********************************
          * Title :: Get an empty datatable to json
          * Description :: 
          * Parameter :: custom message
          * Return :: JSON String
          * Author::Arnab Das
          *********************************/
        public static string DatatableEmpty(string msg = "")
        {
            _Status = false;
            MainArr = new Dictionary<string, object>();
            msg = string.IsNullOrEmpty(msg.Trim()) ? "Data not available." : msg;
            MainArr.Add("status", _Status);
            MainArr.Add("response", msg);
            _jsonString = ObjectToJsonString(MainArr);
            return _jsonString;
        }

        /*********************************
          * Title :: Convert JSON to anyone dynamic
          * Description :: 
          * Parameter :: custom message, type
          * Return :: dynamic
          * Author::Arnab Das
          *********************************/
        public static dynamic Deserialize(string content, Type convertType = null)
        {
            if (string.IsNullOrEmpty(content))
            {
                return "Data not available.";
            }

            try
            {
                if (convertType != null)
                {
                    return System.Text.Json.JsonSerializer.Deserialize(content, convertType);
                }
                else
                {
                    return System.Text.Json.JsonSerializer.Deserialize<dynamic>(content);
                }
            }
            catch (Exception e)
            {
                // Handle JSON deserialization errors
                return $"Deserialization error: {e.Message}";
            }
        }

        /*********************************
          * Title :: Convert JSON to DataTable
          * Description :: 
          * Parameter :: json data
          * Return :: dynamic
          * Author::Arnab Das
          *********************************/
        public static DataTable JsonToDatatable(string content, string tablename = "")
        {
            dTable = new DataTable();
            dTable = tablename.Trim() == string.Empty ? new DataTable() : new DataTable(tablename);
            MainArr = new Dictionary<string, object>();
            ArrayList mainData;
            MainArr = (Dictionary<string, object>)Deserialize(content, (typeof(Dictionary<string, object>)));
            if (MainArr.ContainsKey("status"))
            {
                if (Convert.ToBoolean(MainArr["status"]))
                {
                    if (MainArr.ContainsKey("response"))
                    {
                        var objType = MainArr["response"].GetType();
                        if (objType.Name.ToLower() == "string")
                        {
                            //dTable.Columns.Add("status");
                            dTable.Columns.Add("response");
                            //object[] row = new object[] { MainArr["status"], MainArr["response"] };
                            object[] row = new object[] { MainArr["status"], MainArr["response"] };
                            dTable.Rows.Add(row);
                        }
                        else if (objType.Name.ToLower() == "arraylist")
                        {
                            mainData = new ArrayList();
                            mainData = (ArrayList)MainArr["response"];
                            foreach (Dictionary<string, object> data in mainData)
                            {
                                int count = data.Keys.Count;
                                if (count > 0)
                                {
                                    List<string> keys = data.Keys.ToList();
                                    List<object> values = data.Values.ToList();
                                    object[] array = new object[values.Count];
                                    if (dTable.Columns.Count == 0)
                                    {
                                        for (int i = 0; i < keys.Count; i++)
                                        {
                                            dTable.Columns.Add(keys[i]);
                                        }
                                        //dTable.Columns.Add("status");
                                    }

                                    for (int i = 0; i < values.Count; i++)
                                    {
                                        array[i] = values[i];
                                    }
                                    //array[values.Count] = MainArr["status"];
                                    dTable.Rows.Add(array);
                                }
                            }
                        }
                    }
                    else
                    {
                        throw new Exception("'Response' key does not contain in json format.");
                    }
                }
            }
            else
            {
                throw new Exception("'Status' key does not contain in json format.");
            }
            return dTable;
        }


        /*********************************
        * Title :: Get Ip address 
        * Parameter :: null
        * Return :: Ip
        * Author :: Arnab Das
        *********************************/
        public static string GetIp()
        {
            string hostName = Dns.GetHostName(); // Retrive the Name of HOST  
            Console.WriteLine(hostName);
            // Get the IP  
            //string myIP = Dns.GetHostByName(hostName).AddressList[0].ToString();
            string myIP = Dns.GetHostEntry(hostName).AddressList[0].ToString();
            return myIP;
        }
        /*********************************
         * Title :: Get Mac address 
         * Parameter :: null
         * Return :: mac
         * Author :: Arnab Das
         *********************************/
        public static string GetMac()
        {
            NetworkInterface[] nics = NetworkInterface.GetAllNetworkInterfaces();
            string sMacAddress = string.Empty;
            foreach (NetworkInterface adapter in nics)
            {
                if (sMacAddress == String.Empty)// only return MAC Address from first card  
                {
                    IPInterfaceProperties properties = adapter.GetIPProperties();
                    sMacAddress = adapter.GetPhysicalAddress().ToString();
                }
            }
            return sMacAddress;
        }

        /*********************************
         * Title :: createFileName 
         * Parameter :: id, modulename, fileextenion, format
         * Return :: full path
         * Author :: Arnab Das
         *********************************/
        public static string createFileName(string id, string modulename, string fileExtension, string format)
        {
            string fileName = string.Empty;
            fileName = id + "_" + modulename + "_" + DateTime.Now.ToString("ddMMyyyyhhmmss") + "" + fileExtension + "" + format;
            return fileName;
        }


    }
}