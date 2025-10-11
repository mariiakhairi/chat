import FileUploadZone from '../FileUploadZone';

export default function FileUploadZoneExample() {
  const handleFileSelect = (file: File) => {
    console.log('File selected:', file.name);
  };

  return <FileUploadZone onFileSelect={handleFileSelect} />;
}
