# Use np.histogram to bin the samples
counts, bin_edges = np.histogram(u, bins=bins)

# Print the bin counts and bin edges
print("Bin Counts: ", counts)
print("Bin Edges: ", bin_edges)

# Plotting the histogram
plt.hist(u, bins=bins, edgecolor='black', alpha=0.7)
plt.title('Histogram of Binned Samples')
plt.xlabel('Value')
plt.ylabel('Frequency')
plt.xticks(bin_edges)  # Set the x-ticks to match the bin edges
plt.grid(True)

# Show the plot
plt.show()