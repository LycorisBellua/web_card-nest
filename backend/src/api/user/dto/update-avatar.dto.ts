import { Matches, MaxLength } from 'class-validator';

// NOTE: The frontend validates avatars as File objects (PNG type, ≤ 1 MB,
// ≤ 400×400 px). Those checks must live in the file-upload endpoint/handler
// where the actual binary is available. This DTO only receives the stored
// path/URL string after a successful upload, so validation is limited to
// confirming the path references a PNG file. No sanitization is applied
// because paths should not be normalised or trimmed by the server.
export class UpdateAvatarDto {
  @MaxLength(255)
  @Matches(/^(?:.*[/\\])?[^/\\]+\.png$/i, {
    message: 'The avatar can only be in PNG format.',
  })
  avatar: string;
}
