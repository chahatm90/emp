variable "project" {
  default = "empdir"
}

variable "environment" {
  default = "prod"
}

variable "location" {
  default = "eastus"
}

variable "sql_admin_login" {
  default   = "sqladmin"
  sensitive = true
}

variable "sql_admin_password" {
  sensitive = true
}

variable "tags" {
  default = {
    Project     = "EmployeeDirectory"
    ManagedBy   = "Terraform"
    Environment = "prod"
  }
}
