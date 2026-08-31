import NoteController from '@/actions/App/Http/Controllers/NoteController';

function csrfToken(): string {
    const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);

    return match ? decodeURIComponent(match[1]) : '';
}

export async function uploadNoteImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(NoteController.storeImage.url(), {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'X-XSRF-TOKEN': csrfToken(),
        },
        body: formData,
        credentials: 'same-origin',
    });

    if (!response.ok) {
        throw new Error('Image upload failed.');
    }

    const data = (await response.json()) as { url?: string };

    if (!data.url) {
        throw new Error('Image upload response was invalid.');
    }

    return data.url;
}
