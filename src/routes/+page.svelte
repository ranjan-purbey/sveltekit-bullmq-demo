<script>
  let result = $state();

  $inspect(result);

  const handleClick = async () => {
    const response = await fetch("/", { method: "post" });
    const reader = await response.body.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      result = JSON.parse(new TextDecoder().decode(value));
    }

    setTimeout(() => (result = undefined), 3e3);
  };
</script>

{#if result?.error}
  <div class="error">{result.error}</div>
{:else if result?.data}
  <div class="success">{result.data}</div>
{:else if result?.progress !== undefined}
  <label>
    {result.progress === 100 ? "Done" : "Processing..."}
    <progress value={result.progress} max="100"></progress>
    {result.progress}%
  </label>
{:else}
  <button onclick={handleClick}>Schedule Background Job</button>
{/if}

<style>
  .error {
    color: red;
  }
  .success {
    color: darkgreen;
  }
</style>
