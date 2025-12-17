import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Filter, MoreHorizontal, Plus, FileSpreadsheet, Search, AlertTriangle } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useEquipment, useCreateEquipment, useDeleteEquipment } from "@/lib/api";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/hooks/use-toast";

export default function EquipmentMaster() {
  const { data: equipmentList, isLoading, isError } = useEquipment();
  const createEquipment = useCreateEquipment();
  const deleteEquipment = useDeleteEquipment();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    equipmentId: "",
    name: "",
    type: "",
    manufacturer: "",
    model: "",
    serialNumber: "",
    location: "",
    status: "Operational" as const,
    qualificationStatus: "",
    pmFrequency: "",
    description: "",
  });

  const resetForm = () => {
    setFormData({
      equipmentId: "",
      name: "",
      type: "",
      manufacturer: "",
      model: "",
      serialNumber: "",
      location: "",
      status: "Operational",
      qualificationStatus: "",
      pmFrequency: "",
      description: "",
    });
  };

  const handleCreate = async () => {
    if (!formData.equipmentId || !formData.name || !formData.type || !formData.location) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields (Equipment ID, Name, Type, Location).",
        variant: "destructive",
      });
      return;
    }

    // Clean data - only send non-empty optional fields
    const cleanData = {
      equipmentId: formData.equipmentId,
      name: formData.name,
      type: formData.type,
      location: formData.location,
      status: formData.status,
      ...(formData.manufacturer && { manufacturer: formData.manufacturer }),
      ...(formData.model && { model: formData.model }),
      ...(formData.serialNumber && { serialNumber: formData.serialNumber }),
      ...(formData.qualificationStatus && { qualificationStatus: formData.qualificationStatus }),
      ...(formData.pmFrequency && { pmFrequency: formData.pmFrequency }),
      ...(formData.description && { description: formData.description }),
    };

    try {
      await createEquipment.mutateAsync(cleanData);
      toast({
        title: "Equipment Added",
        description: `${formData.name} has been successfully added to the registry.`,
      });
      setIsAddDialogOpen(false);
      resetForm();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add equipment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to decommission this equipment?")) return;
    
    try {
      await deleteEquipment.mutateAsync(id);
      toast({
        title: "Equipment Decommissioned",
        description: "Equipment has been successfully removed from the system.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to decommission equipment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const filteredEquipment = equipmentList?.filter(item => 
    item.equipmentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-rose-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900">Error Loading Equipment</h3>
          <p className="text-slate-500">Failed to load equipment data. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Equipment Master</h2>
          <p className="text-slate-500">Centralized registry of all GMP assets and qualification status.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" data-testid="button-add-equipment">
                <Plus className="mr-2 h-4 w-4" />
                Add New Equipment
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Add New Equipment</DialogTitle>
                <DialogDescription>
                  Register new equipment in the GMP asset registry.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="equipmentId">Equipment ID *</Label>
                    <Input
                      id="equipmentId"
                      placeholder="e.g., EQ-BIO-001"
                      value={formData.equipmentId}
                      onChange={(e) => setFormData({ ...formData, equipmentId: e.target.value })}
                      data-testid="input-equipment-id"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Bioreactor 500L"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      data-testid="input-equipment-name"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Type *</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => setFormData({ ...formData, type: value })}
                    >
                      <SelectTrigger data-testid="select-equipment-type">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Bioreactor">Bioreactor</SelectItem>
                        <SelectItem value="Centrifuge">Centrifuge</SelectItem>
                        <SelectItem value="Chromatography">Chromatography System</SelectItem>
                        <SelectItem value="Fermenter">Fermenter</SelectItem>
                        <SelectItem value="Mixer">Mixer</SelectItem>
                        <SelectItem value="Pump">Pump</SelectItem>
                        <SelectItem value="Tank">Tank</SelectItem>
                        <SelectItem value="Filter">Filter System</SelectItem>
                        <SelectItem value="Analyzer">Analyzer</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location *</Label>
                    <Select
                      value={formData.location}
                      onValueChange={(value) => setFormData({ ...formData, location: value })}
                    >
                      <SelectTrigger data-testid="select-equipment-location">
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Production Hall A">Production Hall A</SelectItem>
                        <SelectItem value="Production Hall B">Production Hall B</SelectItem>
                        <SelectItem value="QC Lab">QC Lab</SelectItem>
                        <SelectItem value="R&D Lab">R&D Lab</SelectItem>
                        <SelectItem value="Warehouse">Warehouse</SelectItem>
                        <SelectItem value="Utilities">Utilities</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="manufacturer">Manufacturer</Label>
                    <Input
                      id="manufacturer"
                      placeholder="e.g., Sartorius"
                      value={formData.manufacturer}
                      onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                      data-testid="input-manufacturer"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="model">Model</Label>
                    <Input
                      id="model"
                      placeholder="e.g., Biostat STR 500"
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      data-testid="input-model"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="serialNumber">Serial Number</Label>
                    <Input
                      id="serialNumber"
                      placeholder="e.g., SN-2024-12345"
                      value={formData.serialNumber}
                      onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                      data-testid="input-serial"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                    >
                      <SelectTrigger data-testid="select-status">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Operational">Operational</SelectItem>
                        <SelectItem value="In Use">In Use</SelectItem>
                        <SelectItem value="Maintenance">Maintenance</SelectItem>
                        <SelectItem value="Offline">Offline</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="qualificationStatus">Qualification Status</Label>
                    <Select
                      value={formData.qualificationStatus}
                      onValueChange={(value) => setFormData({ ...formData, qualificationStatus: value })}
                    >
                      <SelectTrigger data-testid="select-qualification">
                        <SelectValue placeholder="Select qualification" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="IQ">IQ (Installation Qualification)</SelectItem>
                        <SelectItem value="OQ">OQ (Operational Qualification)</SelectItem>
                        <SelectItem value="PQ">PQ (Performance Qualification)</SelectItem>
                        <SelectItem value="Qualified">Qualified</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pmFrequency">PM Frequency</Label>
                    <Select
                      value={formData.pmFrequency}
                      onValueChange={(value) => setFormData({ ...formData, pmFrequency: value })}
                    >
                      <SelectTrigger data-testid="select-pm-frequency">
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Daily">Daily</SelectItem>
                        <SelectItem value="Weekly">Weekly</SelectItem>
                        <SelectItem value="Monthly">Monthly</SelectItem>
                        <SelectItem value="Quarterly">Quarterly</SelectItem>
                        <SelectItem value="Semi-Annually">Semi-Annually</SelectItem>
                        <SelectItem value="Annually">Annually</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Additional details about this equipment..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    data-testid="input-description"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreate} disabled={createEquipment.isPending} data-testid="button-submit-equipment">
                  {createEquipment.isPending ? "Adding..." : "Add Equipment"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium">Asset Inventory</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                type="search"
                placeholder="Search by ID, Name or Serial..."
                className="pl-9 h-9 bg-slate-50"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                data-testid="input-search-equipment"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>Equipment ID</TableHead>
                <TableHead>Name / Model</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Serial No.</TableHead>
                <TableHead>Qualification</TableHead>
                <TableHead>PM Freq.</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEquipment.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-slate-500">
                    {searchTerm ? "No equipment found matching your search." : "No equipment available. Click 'Add New Equipment' to get started."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredEquipment.map((item) => (
                  <TableRow key={item.id} className="hover:bg-slate-50/50" data-testid={`row-equipment-${item.id}`}>
                    <TableCell className="font-mono text-xs font-medium text-slate-700" data-testid={`text-equipment-id-${item.id}`}>{item.equipmentId}</TableCell>
                    <TableCell className="font-medium text-slate-900">{item.name}</TableCell>
                    <TableCell className="text-slate-600">{item.type}</TableCell>
                    <TableCell className="text-slate-600">{item.location}</TableCell>
                    <TableCell className="font-mono text-xs text-slate-500">{item.serialNumber || "-"}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={
                        item.qualificationStatus === "Qualified" 
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }>
                        {item.qualificationStatus || "Pending"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-600 text-xs">{item.pmFrequency || "-"}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={
                        item.status === "Operational" 
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : item.status === "In Use"
                          ? "bg-blue-50 text-blue-700 border-blue-200"
                          : item.status === "Maintenance"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-slate-50 text-slate-700 border-slate-200"
                      }>
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8" data-testid={`button-actions-${item.id}`}>
                            <MoreHorizontal className="h-4 w-4 text-slate-500" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuItem>View Logs</DropdownMenuItem>
                          <DropdownMenuItem>PM Schedule</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-rose-600" 
                            onClick={() => handleDelete(item.id)}
                            data-testid={`button-delete-${item.id}`}
                          >
                            Decommission
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
