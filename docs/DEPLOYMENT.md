# Publishing and browser storage
This is a static site without a server or login. Publish the project folder to a static hosting service.

Assessment files, results, lecture materials, and exam results are stored in IndexedDB on the visitor's browser/device. Timetable entries use local browser storage. These items are not uploaded, synced, or visible to other visitors. Clearing browser site data can remove them. The reminder scrolls during the ten hours before an activity only while the site is open.

For private grades or academic records, do not place them in public asset folders. Secure cross-device storage would require a backend.

To add a public certification, put its image in `assets/certifications/`, copy a certificate card in `index.html`, and change its course title and date.
