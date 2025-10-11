import FilePreviewCard from '../FilePreviewCard';

export default function FilePreviewCardExample() {
  return (
    <FilePreviewCard
      fileName="sample-document.pdf"
      fileSize={524288}
      onRemove={() => console.log('Remove file clicked')}
    />
  );
}
