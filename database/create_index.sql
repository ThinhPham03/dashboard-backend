#tbl_thisperioddata
CREATE INDEX `idx_product_customer_month` ON `tbl_thisperioddata` (`T. Product Id`, `T. Customer Id`, `T. Month`) USING BTREE;
CREATE INDEX `idx_month` ON `tbl_thisperioddata` (`T. Month`) USING BTREE;
CREATE INDEX `idx_product` ON `tbl_thisperioddata` (`T. Product Id`) USING BTREE;
CREATE INDEX `idx_customer` ON `tbl_thisperioddata` (`T. Customer Id`) USING BTREE;
CREATE INDEX `idx_business_unit` ON `tbl_thisperioddata` (`T. Business Unit`) USING BTREE;
CREATE INDEX `idx_medrep` ON `tbl_thisperioddata` (`MEDREP`) USING BTREE;
CREATE INDEX `idx_asm` ON `tbl_thisperioddata` (`ASM`) USING BTREE;