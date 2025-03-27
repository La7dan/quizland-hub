
import { useState } from 'react';
import { createTable, TableColumn } from '@/services/dbService';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, X, Save } from 'lucide-react';

interface CreateTableDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTableCreated: () => void;
}

const DATA_TYPES = [
  'INTEGER', 'BIGINT', 'NUMERIC', 'FLOAT', 'DOUBLE PRECISION', 
  'CHAR', 'VARCHAR', 'TEXT', 'DATE', 'TIME', 'TIMESTAMP', 
  'BOOLEAN', 'UUID', 'JSON', 'JSONB'
];

const CreateTableDialog = ({ open, onOpenChange, onTableCreated }: CreateTableDialogProps) => {
  const [tableName, setTableName] = useState('');
  const [columns, setColumns] = useState<TableColumn[]>([
    { name: 'id', type: 'INTEGER', constraints: 'PRIMARY KEY' }
  ]);
  const [creating, setCreating] = useState(false);
  const { toast } = useToast();

  const handleAddColumn = () => {
    setColumns([...columns, { name: '', type: 'VARCHAR' }]);
  };

  const handleRemoveColumn = (index: number) => {
    setColumns(columns.filter((_, i) => i !== index));
  };

  const handleColumnChange = (index: number, field: keyof TableColumn, value: string) => {
    const newColumns = [...columns];
    newColumns[index] = { ...newColumns[index], [field]: value };
    setColumns(newColumns);
  };

  const handleSubmit = async () => {
    if (!tableName.trim()) {
      toast({
        title: "Error",
        description: "Table name is required",
        variant: "destructive",
      });
      return;
    }

    // Validate column names
    const emptyNameColumns = columns.filter(col => !col.name.trim());
    if (emptyNameColumns.length > 0) {
      toast({
        title: "Error",
        description: "All columns must have a name",
        variant: "destructive",
      });
      return;
    }

    setCreating(true);
    try {
      const result = await createTable(tableName, columns);
      if (result.success) {
        toast({
          title: "Success",
          description: `Table "${tableName}" created successfully`,
        });
        setTableName('');
        setColumns([{ name: 'id', type: 'INTEGER', constraints: 'PRIMARY KEY' }]);
        onTableCreated();
        onOpenChange(false);
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error creating table:', error);
      toast({
        title: "Error",
        description: "Failed to create table",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Table</DialogTitle>
          <DialogDescription>
            Define a new table structure to add to your database.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-4">
          <div>
            <label htmlFor="tableName" className="block text-sm font-medium text-gray-700 mb-1">
              Table Name
            </label>
            <Input
              id="tableName"
              value={tableName}
              onChange={(e) => setTableName(e.target.value)}
              placeholder="Enter table name"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Columns
              </label>
              <button 
                type="button"
                onClick={handleAddColumn}
                className="text-xs flex items-center gap-1 text-blue-600 hover:text-blue-800"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                Add Column
              </button>
            </div>

            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
              {columns.map((column, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="flex-1">
                    <Input
                      value={column.name}
                      onChange={(e) => handleColumnChange(index, 'name', e.target.value)}
                      placeholder="Column name"
                      className="text-sm"
                    />
                  </div>
                  
                  <div className="w-[140px]">
                    <Select
                      value={column.type}
                      onValueChange={(value) => handleColumnChange(index, 'type', value)}
                    >
                      <SelectTrigger className="w-full text-sm">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {DATA_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex-1">
                    <Input
                      value={column.constraints || ''}
                      onChange={(e) => handleColumnChange(index, 'constraints', e.target.value)}
                      placeholder="Constraints (optional)"
                      className="text-sm"
                    />
                  </div>
                  
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveColumn(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={creating} className="gap-2">
            {creating ? (
              <>
                <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                Creating...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Create Table
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTableDialog;
